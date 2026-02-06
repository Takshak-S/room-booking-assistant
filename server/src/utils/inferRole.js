export function inferRoleFromEmail(email) {
  if (email.endsWith('@vitstudent.ac.in')) return 'STUDENT';
  if (email.endsWith('@vit.ac.in')) return 'FACULTY';
  return null;
}
