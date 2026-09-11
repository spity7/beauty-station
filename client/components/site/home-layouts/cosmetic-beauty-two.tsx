import Footer7 from "@/components/footers/Footer7";
import Header13 from "@/components/headers/Header13";
import Banner from "@/components/homes/home-cosmetic-beauty-two/Banner";
import Categories from "@/components/homes/home-cosmetic-beauty-two/Categories";
import Hero from "@/components/homes/home-cosmetic-beauty-two/Hero";
import InstagramPosts from "@/components/homes/home-cosmetic-beauty-two/InstagramPosts";
import Products1 from "@/components/homes/home-cosmetic-beauty-two/Products1";
import VideosSection from "@/components/common/other-components/VideosSection";

export default function CosmeticBeautyTwoHome() {
  return (
    <>
      <Header13 sticky={true} />
      <Hero />
      <Categories />
      <Products1 />
      <Banner />
      <VideosSection />
      <InstagramPosts />
      <Footer7 />
    </>
  );
}
