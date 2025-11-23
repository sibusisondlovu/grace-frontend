import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Step } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface Tour {
  start: () => void;
  complete: () => void;
  cancel: () => void;
  next: () => void;
  back: () => void;
}

export const useProductTour = (autoStart: boolean = false) => {
  const tourRef = useRef<Tour | null>(null);

  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    // Welcome step
    tour.addStep({
      id: 'welcome',
      title: '👋 Welcome to Your Governance Platform!',
      text: 'Let\'s take a quick tour to help you get started with the key features.',
      buttons: [
        {
          text: 'Skip Tour',
          action: tour.cancel,
          secondary: true,
        },
        {
          text: 'Start Tour',
          action: tour.next,
        },
      ],
    });

    // Dashboard overview
    tour.addStep({
      id: 'dashboard',
      title: '📊 Dashboard Overview',
      text: 'This is your main dashboard where you can see key metrics, upcoming meetings, and action items at a glance.',
      attachTo: {
        element: '[data-tour="dashboard"]',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Sidebar navigation
    tour.addStep({
      id: 'navigation',
      title: '🧭 Navigation Menu',
      text: 'Use the sidebar to navigate between different sections: Committees, Meetings, Actions, and more.',
      attachTo: {
        element: '[data-tour="sidebar"]',
        on: 'right',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Committees
    tour.addStep({
      id: 'committees',
      title: '👥 Committees',
      text: 'Manage your committees here. Create new committees, view members, and track committee activities.',
      attachTo: {
        element: '[data-tour="committees-link"]',
        on: 'right',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Meetings
    tour.addStep({
      id: 'meetings',
      title: '📅 Meetings',
      text: 'Schedule meetings, create agendas, track attendance, and manage meeting documents all in one place.',
      attachTo: {
        element: '[data-tour="meetings-link"]',
        on: 'right',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Actions
    tour.addStep({
      id: 'actions',
      title: '✅ Action Items',
      text: 'Track and manage action items assigned to team members. Monitor progress and ensure accountability.',
      attachTo: {
        element: '[data-tour="actions-link"]',
        on: 'right',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Search
    tour.addStep({
      id: 'search',
      title: '🔍 Global Search',
      text: 'Quickly find meetings, documents, decisions, or any content using the global search feature.',
      attachTo: {
        element: '[data-tour="search"]',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // User menu
    tour.addStep({
      id: 'profile',
      title: '⚙️ Settings & Profile',
      text: 'Access your profile, organization settings, and user management from the user menu.',
      attachTo: {
        element: '[data-tour="user-menu"]',
        on: 'bottom',
      },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
          secondary: true,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Final step
    tour.addStep({
      id: 'complete',
      title: '🎉 You\'re All Set!',
      text: 'You can restart this tour anytime from Settings → Help. Ready to get started?',
      buttons: [
        {
          text: 'Finish Tour',
          action: tour.complete,
        },
      ],
    });

    tourRef.current = tour;

    if (autoStart) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        tour.start();
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      tour.complete();
    };
  }, [autoStart]);

  const startTour = () => {
    if (tourRef.current) {
      tourRef.current.start();
    }
  };

  return { startTour };
};
