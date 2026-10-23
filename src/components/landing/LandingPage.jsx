import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  Check,
  Clock3,
  FileSpreadsheet,
  FileCheck2,
  FileText,
  FolderOpen,
  Heart,
  Pin,
  Search,
  ShieldCheck,
  Star,
  Tag,
} from "lucide-react";

const legalPages = {
  terms: {
    title: "Terms and Conditions",
    introduction:
      "These terms describe the basic expectations for using Notespace. By using the application, you agree to use it lawfully and responsibly.",
    sections: [
      {
        heading: "Using the service",
        text: "Do not misuse Notespace, interfere with its operation, or attempt to access another person's account or information.",
      },
      {
        heading: "Your content and account",
        text: "You are responsible for the notes and files you add, including ensuring you have the right to store them. Keep your sign-in details private and tell your account provider if you believe your account has been accessed without permission.",
      },
      {
        heading: "Availability and changes",
        text: "Features may change as Notespace is maintained and improved. The application is provided for general productivity use and is not a substitute for a dedicated system for records that require specific guarantees.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    introduction:
      "Notespace is designed for personal note-taking. This page summarizes data handling visible in the application; it is not a substitute for provider-specific privacy terms.",
    sections: [
      {
        heading: "Notes and folders",
        text: "The application saves notes and folders in this browser's local storage, using a key associated with the active account. People with access to this browser profile may be able to access locally stored information. Clearing browser storage may remove it.",
      },
      {
        heading: "Sign-in",
        text: "Account sign-in uses Firebase Authentication. The authentication provider processes sign-in information under its own policies and terms.",
      },
      {
        heading: "Your choices",
        text: "Avoid entering information you do not want stored in your browser. You can remove locally stored app data through your browser settings; clearing browser data may affect saved notes.",
      },
    ],
  },
  security: {
    title: "Security",
    introduction:
      "Notespace uses Firebase Authentication for account sign-in and stores notes and folders in browser local storage. Security also depends on the device and browser profile used to access the application.",
    sections: [
      {
        heading: "Protect your device",
        text: "Use a device and browser profile that you control, keep your device access protected, and sign out when using a shared device.",
      },
      {
        heading: "Choose what to store",
        text: "Do not use Notespace as a vault for passwords, payment details, or other highly sensitive information. Anyone who can access your browser profile may be able to access locally stored app data.",
      },
      {
        heading: "No unsupported guarantees",
        text: "This page does not claim a particular encryption method, certification, compliance status, or security guarantee. Use an appropriately managed system when your information requires specific protections.",
      },
    ],
  },
};

const features = [
  {
    id: "smart-notes",
    icon: FileText,
    title: "Smart Notes",
    description: "Capture thoughts quickly and shape them into clear, useful notes.",
    detail:
      "Create notes with a rich-text editor, keep edits saved automatically, and attach useful files to a note.",
    benefits: ["Rich-text editing", "Automatic saving", "Note attachments"],
    illustration: "notes",
  },
  {
    id: "folders-tags",
    icon: FolderOpen,
    title: "Folders and Tags",
    description: "Organize work your way with flexible folders and searchable tags.",
    detail:
      "Keep related notes together in folders, then use tags to add another way to organize and find them.",
    benefits: ["Create and manage folders", "Add tags to notes", "Browse by folder or tag"],
    illustration: "folders",
  },
  {
    id: "powerful-search",
    icon: Search,
    title: "Powerful Search",
    description: "Find the details you need across note titles, content, and tags.",
    detail:
      "Search across note titles, text, categories, tags, and task text, then refine results with the available filters.",
    benefits: ["Search note content and titles", "Match tags and task text", "Combine with color filters"],
    illustration: "search",
  },
  {
    id: "favorites-pinned",
    icon: Star,
    title: "Favorites and Pinned Notes",
    description: "Keep the notes you rely on close and easy to revisit.",
    detail:
      "Mark notes as favorites or pin important items so you can quickly find the notes you use most.",
    benefits: ["Dedicated Favorites view", "Dedicated Pinned view", "Quick note actions"],
    illustration: "favorites",
  },
  {
    id: "documents",
    icon: FileCheck2,
    title: "PDF and Document Management",
    description: "Bring supported documents alongside your notes in one workspace.",
    detail:
      "Import supported documents as notes and use the existing PDF viewer for PDF attachments.",
    benefits: ["Import PDF and supported document formats", "Keep files with notes", "Open PDFs in the viewer"],
    illustration: "documents",
  },
  {
    id: "productivity-reminders",
    icon: Bell,
    title: "Productivity and Reminders",
    description: "Track tasks and set reminders for important follow-ups.",
    detail:
      "Add task checklists to notes and set reminders to help keep follow-ups visible in your workspace.",
    benefits: ["Create and complete tasks", "Set reminders on notes", "Review upcoming reminders"],
    illustration: "reminders",
  },
];

function FeatureIllustration({ feature }) {
  const Icon = feature.icon;
  return (
    <div
      className={`public-landing-feature-illustration illustration-${feature.illustration}`}
      aria-hidden="true"
    >
      {feature.illustration === "notes" && (
        <div className="illustration-note-sheet">
          <span className="illustration-note-heading"><FileText size={16} /> Untitled note</span>
          <span className="illustration-line line-wide" />
          <span className="illustration-line" />
          <span className="illustration-line line-short" />
          <span className="illustration-note-status"><Check size={13} /> Saved</span>
        </div>
      )}
      {feature.illustration === "folders" && (
        <div className="illustration-folder-stack">
          <span className="illustration-folder"><FolderOpen size={19} /> Projects <Tag size={13} /></span>
          <span className="illustration-tag-pill">Planning</span>
          <span className="illustration-tag-pill tag-soft">Ideas</span>
        </div>
      )}
      {feature.illustration === "search" && (
        <div className="illustration-search-results">
          <span className="illustration-search-query"><Search size={15} /> project notes</span>
          <span className="illustration-search-result"><FileText size={14} /> Project outline</span>
          <span className="illustration-search-result"><FileText size={14} /> Notes for review</span>
        </div>
      )}
      {feature.illustration === "favorites" && (
        <div className="illustration-favorite-list">
          <span><Star size={15} fill="currentColor" /> Favorite note</span>
          <span><Pin size={15} fill="currentColor" /> Pinned note</span>
          <span><Heart size={15} /> Quick to revisit</span>
        </div>
      )}
      {feature.illustration === "documents" && (
        <div className="illustration-document-list">
          <span><FileText size={19} /> project-brief.pdf <small>PDF</small></span>
          <span><FileSpreadsheet size={19} /> budget.csv <small>CSV</small></span>
          <span><FileText size={19} /> meeting-notes.docx <small>DOCX</small></span>
        </div>
      )}
      {feature.illustration === "reminders" && (
        <div className="illustration-reminder-list">
          <span><Check size={15} /> Review project notes</span>
          <span><Clock3 size={15} /> Reminder set</span>
          <span><Bell size={15} /> Upcoming</span>
        </div>
      )}
      <span className="public-landing-illustration-mark"><Icon size={19} /></span>
    </div>
  );
}

export default function LandingPage({ onOpenWorkspace, dark, onToggleTheme }) {
  const [legalPage, setLegalPage] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const featureDetailHeadingRef = useRef(null);
  const featuresHeadingRef = useRef(null);

  useEffect(() => {
    if (selectedFeature) featureDetailHeadingRef.current?.focus();
  }, [selectedFeature]);

  function scrollToFeatures(event) {
    event.preventDefault();
    const featuresSection = document.getElementById("features");
    if (!featuresSection) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    featuresSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function openLegalPage(page) {
    setLegalPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function openFeatureDetail(feature) {
    setSelectedFeature(feature);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function closeFeatureDetail() {
    setSelectedFeature(null);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.requestAnimationFrame(() => {
      featuresHeadingRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  return (
    <div className={`public-landing-page ${dark ? "dark" : ""}`}>
      <header className="public-landing-header">
        <a
          className="public-landing-brand"
          href="#home"
          aria-label="Notespace home"
          onClick={() => {
            setLegalPage(null);
            setSelectedFeature(null);
          }}
        >
          <span className="public-landing-brand-icon" aria-hidden="true">
            <FileText size={20} />
          </span>
          <span>Notespace</span>
        </a>

        <nav className="public-landing-nav" aria-label="Main navigation">
          {!legalPage && !selectedFeature && (
            <a href="#features" onClick={scrollToFeatures}>Features</a>
          )}
          <button
            type="button"
            className="public-landing-theme-toggle"
            onClick={onToggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            className="public-landing-header-cta"
            onClick={onOpenWorkspace}
          >
            Open My Workspace
            <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      {selectedFeature ? (
        <main
          className="public-landing-feature-detail"
          aria-labelledby="feature-detail-title"
        >
          <button
            type="button"
            className="public-landing-secondary-cta public-landing-feature-back"
            onClick={closeFeatureDetail}
          >
            <ArrowLeft size={16} />
            Back to features
          </button>
          <article className="public-landing-feature-detail-card">
            <FeatureIllustration feature={selectedFeature} />
            <div className="public-landing-feature-detail-copy">
              <span className="public-landing-eyebrow">Notespace feature</span>
              <h1
                id="feature-detail-title"
                ref={featureDetailHeadingRef}
                tabIndex="-1"
              >
                {selectedFeature.title}
              </h1>
              <p>{selectedFeature.detail}</p>
              <h2>What you can do</h2>
              <ul>
                {selectedFeature.benefits.map((benefit) => (
                  <li key={benefit}><Check size={16} />{benefit}</li>
                ))}
              </ul>
              <button
                type="button"
                className="public-landing-primary-cta"
                onClick={closeFeatureDetail}
              >
                Return to features
              </button>
            </div>
          </article>
        </main>
      ) : legalPage ? (
        <main className="public-landing-legal" aria-labelledby="legal-title">
          <button
            type="button"
            className="public-landing-secondary-cta public-landing-legal-back"
            onClick={() => setLegalPage(null)}
          >
            <ArrowLeft size={16} />
            Back to Notespace
          </button>
          <article className="public-landing-legal-content">
            <span className="public-landing-eyebrow">Notespace information</span>
            <h1 id="legal-title">{legalPages[legalPage].title}</h1>
            <p className="public-landing-legal-intro">
              {legalPages[legalPage].introduction}
            </p>
            {legalPages[legalPage].sections.map(({ heading, text }) => (
              <section key={heading}>
                <h2>{heading}</h2>
                <p>{text}</p>
              </section>
            ))}
          </article>
        </main>
      ) : (
        <main id="home">
          <section className="public-landing-hero" aria-labelledby="landing-title">
          <div className="public-landing-hero-copy">
            <span className="public-landing-eyebrow">
              A calmer way to stay organized
            </span>
            <h1 id="landing-title">
              Your ideas, notes, and documents. All in one place.
            </h1>
            <p>
              Notespace brings your everyday thinking together, helping you
              capture ideas, organize important details, and find what matters.
            </p>
            <div className="public-landing-hero-actions">
              <button
                type="button"
                className="public-landing-primary-cta"
                onClick={onOpenWorkspace}
              >
                Open My Workspace
                <ArrowRight size={17} />
              </button>
              <a
                className="public-landing-secondary-cta"
                href="#features"
                onClick={scrollToFeatures}
              >
                Explore Features
              </a>
            </div>
            <div className="public-landing-trust-note">
              <ShieldCheck size={16} />
              <span>A focused space for the work and ideas you care about.</span>
            </div>
          </div>

          <div className="public-landing-visual" aria-hidden="true">
            <div className="public-landing-visual-orbit public-landing-visual-orbit-one" />
            <div className="public-landing-visual-orbit public-landing-visual-orbit-two" />
            <div className="public-landing-paper public-landing-paper-back">
              <span />
              <span />
              <span />
            </div>
            <div className="public-landing-paper public-landing-paper-front">
              <div className="public-landing-paper-icon">
                <FileText size={21} />
              </div>
              <span className="public-landing-paper-line line-strong" />
              <span className="public-landing-paper-line" />
              <span className="public-landing-paper-line line-short" />
              <div className="public-landing-paper-footer">
                <span />
                <span />
              </div>
            </div>
            <span className="public-landing-float-mark mark-blue">
              <FolderOpen size={18} />
            </span>
            <span className="public-landing-float-mark mark-lavender">
              <Star size={17} />
            </span>
            <span className="public-landing-float-mark mark-soft">
              <Bell size={17} />
            </span>
          </div>
        </section>

        <section
          className="public-landing-features"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="public-landing-section-heading">
            <span className="public-landing-eyebrow">Made for your workflow</span>
            <h2 id="features-title" ref={featuresHeadingRef} tabIndex="-1">
              Everything has its place.
            </h2>
            <p>
              Thoughtful tools that help you stay focused and keep useful
              information within reach.
            </p>
          </div>

          <div className="public-landing-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
              <button
                type="button"
                className="public-landing-feature-card"
                key={feature.id}
                onClick={() => openFeatureDetail(feature)}
                aria-label={`Learn more about ${feature.title}`}
              >
                <span className="public-landing-feature-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </button>
              );
            })}
          </div>
          </section>
        </main>
      )}

      <footer className="public-landing-footer">
        <a
          className="public-landing-footer-brand"
          href="#home"
          onClick={() => {
            setLegalPage(null);
            setSelectedFeature(null);
          }}
        >
          Notespace
        </a>
        <span>Make room for what matters.</span>
        <nav aria-label="Legal">
          <button type="button" onClick={() => openLegalPage("terms")}>
            Terms and Conditions
          </button>
          <button type="button" onClick={() => openLegalPage("privacy")}>
            Privacy Policy
          </button>
          <button type="button" onClick={() => openLegalPage("security")}>
            Security
          </button>
        </nav>
      </footer>
    </div>
  );
}
