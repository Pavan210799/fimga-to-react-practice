import Header from "./generated/Header";
import HeroSection from "./generated/HeroSection";
import HowWeWorks from "./generated/HowWeWorks";
import HowToApply from "./generated/HowToApply";
import SelectYourFavouriteJob from "./generated/SelectYourFavouriteJob";
import GetJob from "./generated/GetJob";
import Download from "./generated/Download";
import Footer from "./generated/Footer";

function App() {
  return (
    <>
      <div className="header-shell">
        <Header />
      </div>
      <HeroSection />
      <div className="page">
        <HowWeWorks />
        <HowToApply />
        <SelectYourFavouriteJob />
        <GetJob />
        <Download />
      </div>
      <Footer />
    </>
  );
}

export default App;
