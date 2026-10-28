import DesignGallery from './design-gallery';
import './designs.css';

export const metadata = {
  title: '首页设计方案 · 人生记忆树',
  description: '比较人生记忆树的四套首页字体与布局。',
  robots: {index: false, follow: false},
};

export default function DesignsPage() {
  return <DesignGallery />;
}
