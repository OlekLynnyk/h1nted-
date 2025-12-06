// app/fonts.ts
import { Azeret_Mono } from 'next/font/google';

export const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-azeret',
  display: 'swap',
});
