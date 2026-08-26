import type { WalnutContext } from './walnut';
import SftpClient from 'ssh2-sftp-client';

/** @walnut_method
 * name: SFTP File Transfer
 * description: Transfer file from ${localPath} to ${remotePath} via SFTP
 * actionType: custom_sftp_transfer
 * context: shared
 * needsLocator: false
 * category: File Transfer
 */
export async function sftpTransfer(ctx: WalnutContext) {
  // ctx.args[0] = localPath   (from ${localPath}  — source file on the local machine)
  // ctx.args[1] = remotePath  (from ${remotePath} — destination path on the SFTP server)
  //
  // Credentials come from ctx.params (test data), NOT from description placeholders:
  //   ctx.params.sftpHost     — SFTP server hostname or IP
  //   ctx.params.sftpPort     — SFTP server port (default: 22)
  //   ctx.params.sftpUsername — SFTP login username
  //   ctx.params.sftpPassword — SFTP login password (use sftpPrivateKey for key-based auth)
  //   ctx.params.sftpPrivateKey — (optional) PEM-encoded private key string for key-based auth

  const localPath: string = ctx.args[0];
  const remotePath: string = ctx.args[1];

  if (!localPath || localPath.trim() === '') {
    throw new Error('localPath is empty — provide the source file path via ${localPath} in the step description.');
  }
  if (!remotePath || remotePath.trim() === '') {
    throw new Error('remotePath is empty — provide the destination path via ${remotePath} in the step description.');
  }

  const host: string = ctx.params.sftpHost;
  const port: number = ctx.params.sftpPort ? Number(ctx.params.sftpPort) : 22;
  const username: string = ctx.params.sftpUsername;
  const password: string | undefined = ctx.params.sftpPassword;
  const privateKey: string | undefined = ctx.params.sftpPrivateKey;

  if (!host) throw new Error('ctx.params.sftpHost is required.');
  if (!username) throw new Error('ctx.params.sftpUsername is required.');
  if (!password && !privateKey) {
    throw new Error('Either ctx.params.sftpPassword or ctx.params.sftpPrivateKey must be provided.');
  }

  ctx.log(`SFTP transfer: "${localPath}" → ${host}:${port}${remotePath}`);

  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host,
      port,
      username,
      ...(privateKey ? { privateKey } : { password }),
    });

    ctx.log('SFTP connection established.');

    await sftp.put(localPath, remotePath);

    ctx.log(`File successfully transferred to ${host}:${remotePath}`);
  } finally {
    await sftp.end();
    ctx.log('SFTP connection closed.');
  }
}
