import Imagekit from 'imagekit';
import { env } from '~/env/server';

const imagekit = new Imagekit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadAvatarImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder: 'avatars',
    useUniqueFileName: true,
    tags: ['avatar'],
    isPrivateFile: false,
    transformation: {
      pre: 'w-120,h-120',
    },
  });
}
