const open = () => new Promise((resolve, reject) => {
  const req = indexedDB.open('shengbian-files', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('files');
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(new Error('无法打开附件存储，请检查浏览器存储权限'));
});
export async function saveFile(file) {
  const db = await open();
  const id = crypto.randomUUID();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put(file, id);
    tx.oncomplete = resolve; tx.onerror = () => reject(new Error('附件保存失败，可能已超出存储配额'));
  });
  db.close();
  return { id, name: file.name, type: file.type, size: file.size };
}
export async function readFile(id) {
  const db = await open();
  const file = await new Promise((resolve, reject) => {
    const request = db.transaction('files').objectStore('files').get(id);
    request.onsuccess = () => resolve(request.result); request.onerror = reject;
  });
  db.close(); return file;
}

export async function deleteFile(id) {
  const db = await open();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(new Error('附件删除失败，请重试'));
  });
  db.close();
}
