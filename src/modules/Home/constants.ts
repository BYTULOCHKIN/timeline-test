import type { Milestone } from './types';

export const ALL_TIMELINE_FILTER = 'All';

export const TIMELINE_TAGS = [
    'Launch',
    'Network',
    'Fiber',
    'Expansion',
    'Product',
    'Support',
    'Business',
    'Anniversary',
] as const;

export const MILESTONES: Milestone[] = [
    {
        id: 'founded-2016',
        year: '2016',
        title: 'Company founded for faster everyday internet',
        description:
            'A small engineering team launched a local ISP with a clear promise: reliable home internet, transparent pricing, and direct technical support for every connected building.',
        metrics: {
            Team: '8 people',
            Uptime: '98.6%',
            Coverage: '3 districts',
        },
        tags: ['Launch'],
        image: 'radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.9), transparent 24%), linear-gradient(135deg, #e7f0ff 0%, #9cc8ff 45%, #214d88 100%)',
    },
    {
        id: 'customers-2017',
        year: '2017',
        title: 'First 1,000 customers connected',
        description:
            'The network moved from pilot streets to a dependable neighborhood service, with local installers, proactive monitoring, and customer onboarding refined into a repeatable playbook.',
        metrics: {
            Customers: '1,000+',
            Installers: '12',
            Tickets: '-34%',
        },
        tags: ['Launch', 'Network'],
        image: 'radial-gradient(circle at 72% 20%, rgba(255, 255, 255, 0.82), transparent 20%), linear-gradient(135deg, #eff8ff 0%, #72d2c9 48%, #145961 100%)',
    },
    {
        id: 'fiber-2018',
        year: '2018',
        title: 'First fiber-optic network expansion',
        description:
            'Core routes were upgraded with fiber backbones, reducing latency and creating the capacity foundation for higher speeds across residential buildings.',
        metrics: {
            Fiber: '42 km',
            Latency: '-28%',
            Capacity: '10 Gbps',
        },
        tags: ['Fiber', 'Network', 'Expansion'],
        image: 'radial-gradient(circle at 34% 70%, rgba(255, 255, 255, 0.8), transparent 18%), linear-gradient(135deg, #fff7df 0%, #7ee7c8 43%, #147f95 100%)',
    },
    {
        id: 'business-2019',
        year: '2019',
        title: 'Business internet services launched',
        description:
            'Dedicated plans for offices, retail locations, and small production sites introduced SLA-backed connectivity, static IP options, and priority field support.',
        metrics: {
            Clients: '180 B2B',
            SLA: '99.5%',
            Response: '<4h',
        },
        tags: ['Business', 'Product'],
        image: 'radial-gradient(circle at 72% 72%, rgba(255, 255, 255, 0.75), transparent 22%), linear-gradient(135deg, #edf2ff 0%, #a6b4ff 42%, #40358f 100%)',
    },
    {
        id: 'remote-work-2020',
        year: '2020',
        title: 'Stability program for remote-work growth',
        description:
            'Traffic patterns changed overnight. The operations team expanded monitoring, upgraded peering routes, and shipped new capacity to keep families and teams online.',
        metrics: {
            Traffic: '+67%',
            Incidents: '-41%',
            Peering: '4 routes',
        },
        tags: ['Network', 'Support'],
        image: 'radial-gradient(circle at 22% 22%, rgba(255, 255, 255, 0.78), transparent 19%), linear-gradient(135deg, #eef5ff 0%, #83b7ff 40%, #1d4168 100%)',
    },
    {
        id: 'support-2021',
        year: '2021',
        title: '24/7 customer support center opened',
        description:
            'A dedicated support center brought round-the-clock assistance, faster diagnostics, and a clearer escalation process for urgent connectivity issues.',
        metrics: {
            Availability: '24/7',
            CSAT: '94%',
            'First reply': '2m',
        },
        tags: ['Support'],
        image: 'radial-gradient(circle at 78% 26%, rgba(255, 255, 255, 0.86), transparent 20%), linear-gradient(135deg, #fff1ea 0%, #ffae87 46%, #8d3828 100%)',
    },
    {
        id: 'expansion-2022',
        year: '2022',
        title: 'Expansion into new districts and nearby cities',
        description:
            'The company scaled beyond its original footprint, connecting new residential complexes, schools, clinics, and commercial streets with standardized deployment teams.',
        metrics: {
            Cities: '3',
            Buildings: '420+',
            Coverage: '+55%',
        },
        tags: ['Expansion', 'Network'],
        image: 'radial-gradient(circle at 26% 74%, rgba(255, 255, 255, 0.72), transparent 21%), linear-gradient(135deg, #f3f7ee 0%, #b9d778 42%, #3d6c3d 100%)',
    },
    {
        id: 'portal-2023',
        year: '2023',
        title: 'Speed upgrades and customer portal',
        description:
            'Higher-speed plans arrived alongside a self-service portal where customers could manage payments, plan changes, support requests, and service notifications.',
        metrics: {
            'Max speed': '1 Gbps',
            'Portal users': '31k',
            NPS: '+18',
        },
        tags: ['Product', 'Network'],
        image: 'radial-gradient(circle at 70% 22%, rgba(255, 255, 255, 0.84), transparent 18%), linear-gradient(135deg, #edf6ff 0%, #9cd9ff 42%, #3652a3 100%)',
    },
    {
        id: 'mobile-app-2024',
        year: '2024',
        title: 'Mobile app and smart home packages',
        description:
            'A mobile app simplified account control, outage alerts, and support chat while new smart home packages bundled Wi-Fi optimization with connected devices.',
        metrics: {
            'App rating': '4.8',
            Downloads: '46k',
            Packages: '5',
        },
        tags: ['Product', 'Support'],
        image: 'radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.82), transparent 18%), linear-gradient(135deg, #f1efff 0%, #c0a8ff 45%, #5a3b8c 100%)',
    },
    {
        id: 'modernization-2025',
        year: '2025',
        title: 'Major infrastructure modernization',
        description:
            'Core nodes, backup power, routing equipment, and field diagnostics were modernized to increase resilience and prepare the network for the next decade.',
        metrics: {
            Nodes: '96',
            Backup: '18h',
            Uptime: '99.95%',
        },
        tags: ['Fiber', 'Network'],
        image: 'radial-gradient(circle at 78% 70%, rgba(255, 255, 255, 0.78), transparent 18%), linear-gradient(135deg, #eef9f8 0%, #8fe1df 42%, #173f54 100%)',
    },
    {
        id: 'anniversary-2026',
        year: '2026',
        title: '10-year anniversary and future vision',
        description:
            'Ten years after launch, the company celebrates a decade of connectivity and sets a new roadmap for multi-gigabit fiber, smarter support, and broader regional coverage.',
        metrics: {
            Years: '10',
            Customers: '78k+',
            Fiber: '610 km',
        },
        tags: ['Anniversary', 'Fiber', 'Expansion'],
        image: 'radial-gradient(circle at 24% 22%, rgba(255, 255, 255, 0.92), transparent 21%), linear-gradient(135deg, #fff5de 0%, #ffc36e 42%, #193f7a 100%)',
    },
];
