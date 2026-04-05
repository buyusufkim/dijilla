import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
      else throw err;
    }
  });
  return filelist;
};

const files = walkSync('./src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  if (content.includes('firebase/firestore') || content.includes('firebase/auth') || content.includes('../firebase')) {
    content = content.replace(/from ['"]firebase\/firestore['"]/g, 'from "@/firebase"');
    content = content.replace(/from ['"]firebase\/auth['"]/g, 'from "@/firebase"');
    content = content.replace(/from ['"]\.\.\/firebase['"]/g, 'from "@/firebase"');
    modified = true;
  }

  // Also fix the import in AuthContext.tsx where it imports signOut as firebaseSignOut
  if (file.includes('AuthContext.tsx')) {
    content = content.replace(/signOut as firebaseSignOut/g, 'signOut');
    content = content.replace(/firebaseSignOut\(auth\)/g, 'signOut(auth)');
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
