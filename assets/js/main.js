export class App {
  constructor() {
    this.header = document.querySelector("[data-header]");
    this.linkElements = document.querySelectorAll("nav a");
    this.keypressElements = document.querySelectorAll("[data-keypress]");
    this.sectionElements = document.querySelectorAll("[data-section]");
    this.textElements = document.querySelectorAll(
      ".section p, .section ol, .section ul, .section li"
    );
    this.headingElements = document.querySelectorAll("[data-heading]");
    this.gridGlitchElement = document.querySelector("[data-grid-glitch]");
    this.sidebar = document.getElementById("sidebar");
    this.main = document.querySelector("main");
  }

  init() {
    this.initPreloader();
    this.initScrollToLinks();
    this.initKeypress();
    this.initScrollAnimations();
    this.initSidebar(); // Add this line
  }

  initPreloader() {
    const preloader = document.querySelector("[data-preloader]");
    if (preloader) {
      gsap.to(preloader, {
        duration: 1,
        opacity: 0,
        onComplete: () => {
          preloader.style.display = "none";
        },
      });
    }
  }

  initScrollToLinks() {
    console.log("Initializing scroll to links");
    console.log("Number of link elements:", this.linkElements.length);

    this.linkElements.forEach((link) => {
      console.log("Adding click listener to link:", link.getAttribute("href"));
      link.addEventListener("click", (e) => {
        // Skip preventDefault for top-right-nav links
        if (link.closest('.top-right-nav')) {
          return; // Let the default link behavior happen
        }
        
        e.preventDefault();
        const href = link.getAttribute("href");
        console.log("Link clicked:", href);
        console.log("href value:", href);

        if (href === "/") {
          gsap.to(window, {
            duration: 1,
            scrollTo: { y: 0, autoKill: true }, // Correctly passing scrollTo options
            ease: "power3.inOut",
          });
          window.history.pushState({}, "", "/");
        } else {
          const target = document.querySelector(`[data-section="${href}"]`);
          console.log("Target element:", target);

          if (target) {
            console.log("Scrolling to target");
            gsap.to(window, {
              duration: 1,
              scrollTo: { y: target, offsetY: 50, autoKill: true }, // Correctly passing scrollTo options
              ease: "power3.inOut",
            });
            window.history.pushState({}, "", href);
          } else {
            console.log("Target not found for href:", href);
          }
        }
      });
    });
  }

  initKeypress() {
    document.addEventListener("keypress", (event) => {
      const key = event.key.toLowerCase();
      this.keypressElements.forEach((element) => {
        if (key === element.getAttribute("data-keypress")) {
          event.preventDefault();
          element.click();
        }
      });
    });
  }

  initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const main = document.querySelector("main");

    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      main.classList.toggle("sidebar-active");
    });

    // Close sidebar when clicking outside
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove("active");
        main.classList.remove("sidebar-active");
      }
    });

    // Add this new code to hide sidebar when a nav link is clicked
    const navLinks = sidebar.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("active");
        main.classList.remove("sidebar-active");
      });
    });
  }

  initScrollAnimations() {
    this.sectionElements.forEach((section) => {
      const headingElement = section.querySelector("[data-heading] h2");
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          section.classList.add("active");
          if (headingElement) {
            this.shuffleText(headingElement);
          }
        },
        onLeaveBack: () => {
          section.classList.remove("active");
        },
      });
    });

    this.textElements.forEach((element) => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: 50,
        duration: 1,
        ease: "power3.out",
      });
    });

    // Grid Glitch Effect
    if (this.gridGlitchElement) {
      this.initGridGlitch();
    }
  }

  shuffleText(element) {
    const originalText = element.textContent;
    const possibleChars =
  
    "xAI-Labs|诶克斯-艾-爱-莱布斯|诶克斯-艾-愛-萊布斯|إكس-إي-آي-لابس|एक्स-ई-ए-आई-लैब्स|エックス・イー・アイ・ラブズ|엑스-이-아이-랩스|εξ-ι-αϊ-λαμπς|אקס-אי-איי-לאבס|এক্স-ই-এ-আই-ল্যাবস|ਐਕਸ-ਈ-ਏ-ਆਈ-ਲੈਬਸ|எக்ஸ்-ஈ-ஐ-லாப்ஸ்|ఎక్స్-ఇ-ఎ-ఐ-ల్యాబ్స్|ಎಕ್ಸ್-ಇ-ಎ-ಐ-ಲ್ಯಾಬ್ಸ್|ایکس-ای-آئی-لیبز|เอกซ์-อี-เอ-ไอ-แลบส์|екс-і-ай-лаби|ეგზ-ი-აი-ლაბსი|եκս-ե-աի-լաբս|экс-эи-ай-лабс";

    let currentText = originalText;
    let timeline = gsap.timeline();

    for (let i = 0; i < 20; i++) {
      timeline.add(() => {
        currentText = currentText
          .split("")
          .map((char) =>
            Math.random() > 0.5
              ? possibleChars[Math.floor(Math.random() * possibleChars.length)]
              : char
          )
          .join("");
        element.textContent = currentText;
      }, i * 0.05);
    }

    timeline.add(() => {
      element.textContent = originalText;
    }, 1);
  }

  initGridGlitch() {
    const glitchTimeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    for (let i = 0; i < 5; i++) {
      glitchTimeline.to(this.gridGlitchElement, {
        duration: 0.1,
        skewX: () => Math.random() * 10 - 5,
        skewY: () => Math.random() * 10 - 5,
        x: () => Math.random() * 10 - 5,
        y: () => Math.random() * 10 - 5,
        opacity: () => Math.random() * 0.5 + 0.5,
        ease: "power4.inOut",
      });
    }

    glitchTimeline.to(this.gridGlitchElement, {
      duration: 0.5,
      skewX: 0,
      skewY: 0,
      x: 0,
      y: 0,
      opacity: 1,
      ease: "power4.out",
    });
  }
}

// Initialize the app after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
