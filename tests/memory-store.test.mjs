import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyDraft,saveMemory,listMemories,deleteMemory,clearMemories,parseBackup,importMemories,normalize} from '../app/memory-store.ts';
test('browser storage survives reads, detects conflicts, and merges without overwriting',async()=>{
  await clearMemories();
  const original=await saveMemory({...emptyDraft(),content:'春天的记录',date:'2024-02-29',photoData:'data:image/jpeg;base64,YQ=='});
  assert.equal((await listMemories())[0].photoData,original.photoData);
  const edited=await saveMemory({...original,content:'更新后的记录'},original);
  await assert.rejects(saveMemory({...original,content:'过时的修改'},original),/另一个页面修改/);
  await assert.rejects(deleteMemory(original),/另一个页面修改/);
  const backup=parseBackup(JSON.stringify({format:'life-memory-tree',version:1,memories:[{...original,content:'备份里的旧值'},{...original,id:'new_backup_1',date:'2025-01-01'}]}));
  assert.equal(await importMemories(backup),1);
  const all=await listMemories();assert.equal(all.length,2);assert.equal(all.find(m=>m.id===original.id).content,'更新后的记录');
  await deleteMemory(edited);assert.equal((await listMemories()).length,1);
  await clearMemories();assert.equal((await listMemories()).length,0);
});
test('invalid backups and invalid images are rejected before writing',()=>{
  assert.throws(()=>parseBackup('{}'));
  assert.throws(()=>normalize({...emptyDraft(),content:'test',date:'2025-02-29'}));
  assert.throws(()=>normalize({...emptyDraft(),content:'test',photoData:'javascript:alert(1)'}));
  assert.throws(()=>parseBackup(JSON.stringify({format:'life-memory-tree',version:2,memories:[]})));
});
