/* ============================================================
 * drivestore.js — cliente de DriveStore ("localStorage", pero en
 * Google Drive, compartido entre varias apps sin relación entre sí)
 * ------------------------------------------------------------
 * NÚCLEO. Este archivo solo alcanza para guardar y leer archivos.
 * Las cuentas de usuario son OPCIONALES y viven en dos archivos
 * aparte, que se incluyen sólo si los necesitás:
 *
 *   <script src="drivestore.js"></script>
 *   -> getFile / pushFile / listFiles / deleteFile / downloadFile
 *      (todo lo que había antes de que existieran las cuentas)
 *
 *   <script src="drivestore.js"></script>
 *   <script src="drivestore_ulogin.js"></script>
 *   -> suma register(user, pass) / login(user, pass) / changePassword()
 *
 *   <script src="drivestore.js"></script>
 *   <script src="drivestore_glogin.js"></script>
 *   -> suma loginGmail() / registerGmail() / renderGoogleButton()
 *
 * Los tres se pueden combinar. drivestore.js SIEMPRE va primero: los
 * otros dos le agregan métodos a la clase DriveStore que define acá.
 * Si llamás a un método de login sin haber incluido su archivo, el
 * error te dice exactamente cuál falta.
 *
 * Lo que sí está en el núcleo aunque sea "de usuarios": el manejo de
 * la sesión (currentUser/logout/me) y los archivos privados
 * (getUserFile/pushUserFile/...). Son iguales para los dos tipos de
 * login, así que no tiene sentido duplicarlos — lo que cambia entre
 * ulogin y glogin es sólo CÓMO se consigue la sesión.
 *
 * ------------------------------------------------------------
 *
 * 🤖 PARA FUTUROS AGENTES DE IA (Claude Code u otros) leyendo este
 * archivo: ANTES de usar DriveStore en cualquier tarea, PREGUNTALE
 * al usuario si ya está desplegado y configurado. No asumas que sí.
 * Concretamente, necesitás confirmar con él/ella:
 *
 *   1. ¿Ya deployaste GoogleScript/Code.gs como Web App en
 *      script.google.com? (Execute as: Me, Who has access: Anyone)
 *   2. ¿Tenés la URL /exec de ese deployment? Hace falta para el
 *      parámetro `url` de acá abajo.
 *   3. ¿Configuraste ROOT_FOLDER_ID en Code.gs con el ID real de
 *      una carpeta de Drive? (el placeholder de fábrica no funciona
 *      — ver el aviso grande en Code.gs sobre esto).
 *   4. ¿Ya existe una entrada para este `appid` en el archivo
 *      apps.json dentro de esa carpeta de Drive, con la `apppass`
 *      que vas a usar? Si no existe, hay que crearla A MANO editando
 *      ese archivo en Drive — no hay ningún endpoint para
 *      autoregistrarse (es a propósito, por seguridad).
 *
 *   Y si la tarea toca CUENTAS DE USUARIO (register/login/Google):
 *   5. ¿Incluiste drivestore_ulogin.js y/o drivestore_glogin.js en la
 *      página? Sin eso, esos métodos no existen.
 *   6. ¿Pegaste la versión v2 de Code.gs y aceptaste el permiso nuevo
 *      (UrlFetchApp / script.external_request) ejecutando una función
 *      desde el editor? Sin eso, el login con Google falla siempre.
 *   7. ¿La página se sirve por https:// o http://localhost? Las
 *      cuentas NO funcionan desde file://: crypto.subtle no existe
 *      fuera de un contexto seguro, y Google Sign-In directamente
 *      rechaza el origen file:// (no se puede registrar).
 *   8. Para login con Google: ¿creaste un OAuth Client ID en Google
 *      Cloud, agregaste el origen de la página a "Authorized
 *      JavaScript origins", y pusiste ese client id TANTO en
 *      apps.json como en el constructor de acá abajo?
 *
 * Si el usuario no sabe las respuestas o dice que es la primera vez
 * que usa este backend para esta app en particular, GUIALO por el
 * checklist de "Setup" en README.md de este mismo proyecto (carpeta
 * DriveStore/) antes de escribir código que asuma que ya funciona.
 * Un `pushFile`/`getFile` contra un backend mal configurado no tira
 * un error genérico de red — Code.gs devuelve `{ ok:false, error }`
 * con el motivo puntual (ver DriveStoreError más abajo), pero igual
 * es mejor prevenir que el usuario pierda tiempo debuggeando algo
 * que es sólo "todavía no lo configuré".
 *
 * ------------------------------------------------------------
 * USO — archivos
 *
 *   <script src="drivestore.js"></script>
 *   <script>
 *     const drivestore = new DriveStore({
 *       [url: 'https://script.google.com/macros/s/AKfycb.../exec',] // Optional
 *       appid: 'mi-app',
 *       apppass: 'la-passphrase-que-pusiste-en-apps.json'
 *     });
 *
 *     // Guardar (crea o pisa por completo el archivo — no hace merge)
 *     await drivestore.pushFile('config', { theme: 'dark', count: 3 });
 *
 *     // Leer (null si el archivo todavía no existe)
 *     const data = await drivestore.getFile('config');
 *
 *     // Ver qué archivos tiene guardados esta app
 *     const files = await drivestore.listFiles();
 *     // -> [{ name: 'config', updatedAt: '...', size: 42,
 *     //       owner: null, readonly: false }, ...]
 *
 *     // Borrar
 *     await drivestore.deleteFile('config');
 *
 *     // Traer un archivo y además disparar la descarga en el
 *     // navegador (Guardar como... un .json)
 *     await drivestore.downloadFile('config');
 *   </script>
 *
 * `data` puede ser cualquier valor serializable a JSON (objeto,
 * array, string, número, bool). Cada pushFile GUARDA TODO EL
 * ARCHIVO DE NUEVO — no hace merge parcial, igual que
 * localStorage.setItem(). Si necesitás actualizar sólo una parte,
 * traé el archivo con getFile(), modificá el objeto en JS, y
 * volvé a pushear el objeto completo.
 *
 * NOTA DE ALCANCE: este cliente sólo soporta valores JSON. No sirve
 * para subir imágenes, PDFs u otros binarios — para eso hace falta
 * extender Code.gs (no está implementado acá a propósito, para
 * mantener el contrato simple).
 * ============================================================ */

class DriveStoreError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DriveStoreError';
  }
}

const DRIVESTORE_SESSION_KEY = 'drivestore.session';
const DRIVESTORE_DEFAULTS = {
	url: 'https://script.google.com/macros/s/AKfycbxWz_NvFriUjtj9i3-_iD_C_XlBNWoEQnlbmdgdVFi-eTbfawSdJbx9sV7r_TtGrdAE/exec',
	googleClientId: '733593898992-km9uibamvr46sluu7esfa003rqr2ole5.apps.googleusercontent.com',

	appid: '',
	apppass: '',
}

class DriveStore {
	
  /**
   * @param {Object} opts
   * @param {string} opts.url             URL /exec del deployment de Code.gs. Opcional.
   * @param {string} opts.appid           Identificador de tu app (clave en apps.json).
   * @param {string} opts.apppass         Passphrase de tu app (valor en apps.json).
   * @param {string} [opts.googleClientId] OAuth Client ID para login con Google.
   *                                       Lo usa drivestore_glogin.js. Tiene que ser
   *                                       el MISMO que pusiste en apps.json, si no el
   *                                       servidor rechaza el token.
   * @param {boolean} [opts.persistSession=true] Guardar la sesión en sessionStorage
   *                                       para que sobreviva a un F5.
   */
  constructor(opts) {
    opts = opts || DRIVESTORE_DEFAULTS;
	this.url = opts.url || DRIVESTORE_DEFAULTS.url;
    this.googleClientId = opts.googleClientId || DRIVESTORE_DEFAULTS.googleClientId;
	
    this.appid = opts.appid || DRIVESTORE_DEFAULTS.appid;
    this.apppass = opts.apppass || DRIVESTORE_DEFAULTS.apppass;
    
	this.persistSession = opts.persistSession !== false;

    this._session = null;
    this._user = null;
    this._restoreSession();
  }

  isConfigured() {
    return !!(this.url && this.appid && this.apppass);
  }

  /* ===================== transporte ===================== */

  async _call(payload) {
    if (!this.url) {
      throw new DriveStoreError('DriveStore: falta drivestore.url (la URL /exec del backend).');
    }
    if (!this.appid || !this.apppass) {
      throw new DriveStoreError('DriveStore: falta drivestore.appid y/o drivestore.apppass.');
    }

    let res;
    try {
      res = await fetch(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ appid: this.appid, pass: this.apppass }, payload))
      });
    } catch (networkErr) {
      throw new DriveStoreError('DriveStore: no se pudo conectar al backend (' + networkErr.message + ').');
    }

    const result = await res.json();
    if (!result.ok) {
      throw new DriveStoreError('DriveStore: ' + (result.error || 'error desconocido del backend.'));
    }
    return result;
  }

  // Igual que _call pero adjuntando la sesión. Si `required` es true y
  // no hay sesión, corta acá sin ir al servidor.
  async _callAuthed(payload, required) {
    if (required && !this._session) {
      throw new DriveStoreError('DriveStore: hay que iniciar sesión primero (login/register/loginGmail).');
    }
    const withSession = this._session
      ? Object.assign({ session: this._session }, payload)
      : payload;
    try {
      return await this._call(withSession);
    } catch (err) {
      // Si el backend dice que la sesión no vale, la limpiamos acá
      // para que currentUser() no siga mintiendo. El próximo intento
      // sale como anónimo, que para los archivos generales alcanza.
      if (/Sesión inválida o vencida/.test(err.message || '')) this._clearSession();
      throw err;
    }
  }

  /**
   * Error para cuando se llama a un método que vive en un archivo
   * opcional que no se incluyó. Mucho más útil que el
   * "ds.login is not a function" que saldría si no hubiera stubs.
   */
  static _missingModule(file, method) {
    return new DriveStoreError(
      'DriveStore: ' + method + '() está en ' + file + ', que no se incluyó en esta página. ' +
      'Agregá <script src="' + file + '"></script> DESPUÉS de drivestore.js.'
    );
  }

  /* ===================== sesión ===================== */

  _storage() {
    try {
      return (this.persistSession && typeof sessionStorage !== 'undefined') ? sessionStorage : null;
    } catch (e) {
      return null; // navegador con storage bloqueado
    }
  }

  _sessionStorageKey() {
    return DRIVESTORE_SESSION_KEY + ':' + this.appid;
  }

  _restoreSession() {
    const store = this._storage();
    if (!store) return;
    try {
      const raw = store.getItem(this._sessionStorageKey());
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && saved.session && Number(saved.expiresAt) > Date.now()) {
        this._session = saved.session;
        this._user = saved.user || null;
      } else {
        store.removeItem(this._sessionStorageKey());
      }
    } catch (e) { /* storage corrupto: arrancamos sin sesión */ }
  }

  // La usan drivestore_ulogin.js y drivestore_glogin.js cuando el
  // backend les devuelve una sesión nueva.
  _setSession(token, expiresAt, user) {
    this._session = token;
    this._user = user || null;
    const store = this._storage();
    if (!store) return;
    try {
      store.setItem(this._sessionStorageKey(), JSON.stringify({
        session: token, expiresAt: expiresAt, user: user || null
      }));
    } catch (e) { /* sin storage: la sesión vive sólo en memoria */ }
  }

  _clearSession() {
    this._session = null;
    this._user = null;
    const store = this._storage();
    if (!store) return;
    try {
      store.removeItem(this._sessionStorageKey());
    } catch (e) { /* nada que hacer */ }
  }

  /** El usuario logueado, o null. No va al servidor. */
  currentUser() {
    return this._session ? this._user : null;
  }

  isLoggedIn() {
    return !!this._session;
  }

  /** Le pregunta al servidor quién está logueado (revalida la sesión). */
  async me() {
    if (!this._session) return null;
    const result = await this._callAuthed({ action: 'me' }, false);
    if (!result.user) {
      this._clearSession();
      return null;
    }
    this._user = result.user;
    return result.user;
  }

  /** Cierra la sesión, también del lado del servidor. */
  async logout() {
    if (!this._session) return true;
    try {
      await this._call({ action: 'logout', session: this._session });
    } finally {
      this._clearSession();
    }
    return true;
  }

  /* ===================== login (en archivos aparte) ===================== */

  /*
   * Estos cinco métodos son sólo carteles indicadores: los reemplazan
   * drivestore_ulogin.js y drivestore_glogin.js al cargarse.
   */

  async register() { throw DriveStore._missingModule('drivestore_ulogin.js', 'register'); }
  async login() { throw DriveStore._missingModule('drivestore_ulogin.js', 'login'); }
  async changePassword() { throw DriveStore._missingModule('drivestore_ulogin.js', 'changePassword'); }
  async loginGmail() { throw DriveStore._missingModule('drivestore_glogin.js', 'loginGmail'); }
  async registerGmail() { throw DriveStore._missingModule('drivestore_glogin.js', 'registerGmail'); }
  async renderGoogleButton() { throw DriveStore._missingModule('drivestore_glogin.js', 'renderGoogleButton'); }

  /** ¿Está cargado el módulo de login con usuario y contraseña? */
  static hasUserLogin() {
    return DriveStore.prototype.login.__drivestoreModule === 'ulogin';
  }

  /** ¿Está cargado el módulo de login con Google? */
  static hasGoogleLogin() {
    return DriveStore.prototype.loginGmail.__drivestoreModule === 'glogin';
  }

  /* ===================== archivos generales ===================== */

  /**
   * Trae el contenido de un archivo. Devuelve `null` si todavía no
   * existe (no es un error — es el estado normal de "nunca se
   * pusheó nada con ese name").
   */
  /**
   * Trae el contenido de un archivo. Devuelve `null` si todavía no
   * existe (no es un error — es el estado normal de "nunca se
   * pusheó nada con ese name").
   *
   * Va por _call y NO por _callAuthed a propósito: un archivo general
   * lo lee cualquiera (incluso los readonly), así que mandar la sesión
   * no cambiaría el resultado y en cambio obliga al backend a
   * resolverla, que en el peor caso son 6 llamadas a Drive de más.
   * Tampoco pide withMeta, porque acá descartamos owner/readonly —
   * si los querés, están en listFiles()/listEntries().
   */
  async getFile(name) {
    const result = await this._call({ action: 'get', name: name, scope: 'general' });
    return result.exists ? result.data : null;
  }

  /**
   * Crea o pisa por completo un archivo. `data` es cualquier valor
   * serializable a JSON. Devuelve { name, updatedAt }.
   *
   * @param {Object} [opts]
   * @param {boolean} [opts.readonly] Marca el archivo como de sólo
   *   lectura: lo lee cualquiera, pero sólo lo edita quien lo creó.
   *   Requiere estar logueado (alguien tiene que ser el dueño).
   *   Si no pasás la opción, el readonly que ya tenga no se toca.
   */
  async pushFile(name, data, opts) {
    const payload = { action: 'push', name: name, data: data, scope: 'general' };
    if (opts && opts.readonly !== undefined) payload.readonly = !!opts.readonly;
    return this._callAuthed(payload, false);
  }

  /**
   * Lista los archivos generales de esta app:
   * [{ name, updatedAt, size, owner, readonly }].
   */
  async listFiles(path) {
    return (await this.listEntries(path)).files;
  }

  /** Las subcarpetas de `path`: [{ name, path }]. */
  async listFolders(path) {
    return (await this.listEntries(path)).folders;
  }

  /**
   * Archivos y subcarpetas de una carpeta, en UNA sola llamada:
   * { path, files, folders }. Es lo que conviene para dibujar un
   * explorador — listFiles() y listFolders() son azúcar encima, y si
   * necesitás las dos cosas, dos llamadas son un viaje de más.
   *
   * No baja recursivamente: lista sólo el nivel pedido.
   */
  async listEntries(path) {
    const result = await this._callAuthed(
      { action: 'list', scope: 'general', path: path || '' }, false);
    return { path: result.path, files: result.files, folders: result.folders };
  }

  /**
   * Las carpetas no son objetos reales: se deducen de las rutas de los
   * archivos. O sea que una carpeta existe mientras tenga algo adentro,
   * y **borrar su último archivo la hace desaparecer sola**.
   *
   * Este método queda como chequeo explícito: falla si la carpeta
   * todavía tiene archivos (no hay borrado recursivo a propósito), y si
   * está vacía devuelve false porque ya no había nada que borrar.
   */
  async deleteFolder(path) {
    const result = await this._callAuthed(
      { action: 'deleteFolder', path: path, scope: 'general' }, false);
    return result.deleted;
  }

  /** Borra un archivo. Devuelve true/false según si existía. */
  async deleteFile(name) {
    const result = await this._callAuthed({ action: 'delete', name: name, scope: 'general' }, false);
    return result.deleted;
  }

  /**
   * Se queda como dueño de un archivo general que todavía no tiene
   * dueño (típicamente uno creado antes de que la app tuviera
   * usuarios), y de paso le prende o apaga el readonly. Falla si el
   * archivo ya es de otro.
   */
  async claimFile(name, readonly) {
    return this._callAuthed({ action: 'claim', name: name, readonly: !!readonly }, true);
  }

  /**
   * Trae un archivo Y además dispara la descarga en el navegador
   * (como un <a download>), para el caso de uso "quiero bajarme mis datos".
   * Devuelve los datos igual que getFile(), por si también
   * los querés usar en JS sin pedirlos dos veces.
   */
  async downloadFile(name) {
    return this._download(name, await this.getFile(name));
  }

  /* ===================== archivos privados del usuario ===================== */

  /**
   * Los cinco métodos de acá abajo trabajan sobre la carpeta privada
   * del usuario logueado. La carpeta la resuelve el SERVIDOR a partir
   * de la sesión: no hay ningún parámetro para nombrar la carpeta de
   * otro usuario, así que no hay forma de leer ni escribir lo ajeno.
   *
   * Están en el núcleo y no en los archivos de login porque son
   * iguales sea cual sea la forma en que conseguiste la sesión.
   */

  async getUserFile(name) {
    const result = await this._callAuthed({ action: 'get', name: name, scope: 'user' }, true);
    return result.exists ? result.data : null;
  }

  async pushUserFile(name, data) {
    return this._callAuthed({ action: 'push', name: name, data: data, scope: 'user' }, true);
  }

  async listUserFiles(path) {
    return (await this.listUserEntries(path)).files;
  }

  async listUserFolders(path) {
    return (await this.listUserEntries(path)).folders;
  }

  async listUserEntries(path) {
    const result = await this._callAuthed(
      { action: 'list', scope: 'user', path: path || '' }, true);
    return { path: result.path, files: result.files, folders: result.folders };
  }

  async deleteUserFolder(path) {
    const result = await this._callAuthed(
      { action: 'deleteFolder', path: path, scope: 'user' }, true);
    return result.deleted;
  }

  async deleteUserFile(name) {
    const result = await this._callAuthed({ action: 'delete', name: name, scope: 'user' }, true);
    return result.deleted;
  }

  async downloadUserFile(name) {
    return this._download(name, await this.getUserFile(name));
  }

  _download(name, data) {
    // Si el name es una ruta ("notas/2026/enero"), el archivo que se
    // baja se llama "enero.json" — las barras no van en un nombre de
    // archivo del sistema operativo.
    const base = String(name).split('/').filter(Boolean).pop() || 'download';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = base + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return data;
  }
}
