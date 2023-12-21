let db

function getObjectStore(dbStoreName, mode) {
  if (!db) {
    return null
  }
  const tx = db.transaction(dbStoreName, mode)
  return tx.objectStore(dbStoreName)
}

export function closeAndDeleteDb(dbStoreName) {
  db.close()

  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
  indexedDB.deleteDatabase(dbStoreName)
}

export function setupDb(dbStoreName, dbVersion, fields) {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
  const request = indexedDB.open(dbStoreName, dbVersion)

  request.onerror = (event) => {
    console.error(event.target.errorCode)
  }

  request.onsuccess = (event) => {
    db = event.target.result
  }

  request.onupgradeneeded = (event) => {
    const thisDb = event.target.result

    thisDb.onerror = (event) => {
      console.error(event)
    }

    if (!thisDb.objectStoreNames.contains(dbStoreName)) {
      const objectStore = thisDb.createObjectStore(dbStoreName, { keyPath: 'id', autoIncrement: true })

      for (let i = 0; i < fields.length; i++) {
        objectStore.createIndex(fields[i], fields[i], { unique: false })
      }
    }
  }
}

export function saveToDb(dbStoreName, newRecord) {
  const store = getObjectStore(dbStoreName, 'readwrite')
  if (!store) {
    return
  }
  const req = store.add(newRecord)
  req.onerror = () => {
    console.error(this.error)
  }
}

export function sendFromDb(dbStoreName, sendData) {
  const store = getObjectStore(dbStoreName, 'readwrite')
  if (!store) {
    return
  }
  const req = store.getAll()
  req.onerror = () => {
    console.error(this.error)
  }
  req.onsuccess = async (event) => {
    for (let i = 0; i < event.target.result.length; i++) {
      const formData = event.target.result[i]
      await sendData(formData)
    }
  }
}
