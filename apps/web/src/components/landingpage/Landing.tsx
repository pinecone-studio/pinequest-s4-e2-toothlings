import React from 'react'
import { Zap, BarChart, Target, PieChart, Users, TrendingUp } from 'lucide-react'

import {
  Header,
  Hero,
  ServicesSection,
  StatsSection,
  TeamSection,
  TestimonialsSection,
  CTA,
  ContactForm,
  Footer,
} from '@/components/landingpage'

const LandingPage: React.FC = () => {
  const handleContactFormSubmit = (formData: any) => {
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        logo="Up Digital"
        navItems={[
          { label: 'Services', href: '#services' },
          { label: 'Team', href: '#team' },
          { label: 'Testimonials', href: '#testimonials' },
          { label: 'Contact', href: '#contact' },
        ]}
        ctaText="Get Started"
        onCTAClick={() => {
          const element = document.getElementById('contact')
          element?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      <Hero
        title="Transform Your Business with Data-Driven Marketing"
        subtitle="We combine cutting-edge strategies with proven analytics to accelerate your growth and maximize ROI."
        ctaText="Start Your Journey"
        ctaSecondaryText="Learn More"
      />

      <ServicesSection
        title="Our Services"
        subtitle="Comprehensive marketing solutions tailored to your business needs"
        services={[
          {
            icon: <Target size={32} className="text-white" />,
            title: 'SEO & SEM',
            description:
              'Boost your online visibility and drive qualified traffic to your website.',
            features: [
              'Keyword research & optimization',
              'Link building strategies',
              'PPC campaign management',
              'Conversion rate optimization',
            ],
          },
          {
            icon: <TrendingUp size={32} className="text-white" />,
            title: 'Social Media Marketing',
            description:
              'Engage your audience and build meaningful relationships on social platforms.',
            features: [
              'Content creation & strategy',
              'Community management',
              'Influencer partnerships',
              'Social analytics & reporting',
            ],
            isHighlighted: true,
          },
          {
            icon: <BarChart size={32} className="text-white" />,
            title: 'Analytics & Reporting',
            description: 'Make data-driven decisions with comprehensive insights and analytics.',
            features: [
              'Custom dashboards',
              'Performance tracking',
              'Competitor analysis',
              'Growth recommendations',
            ],
          },
          {
            icon: <Zap size={32} className="text-white" />,
            title: 'Email Marketing',
            description: 'Nurture leads and drive conversions through targeted email campaigns.',
            features: [
              'Automated workflows',
              'Segmentation strategies',
              'A/B testing',
              'Performance optimization',
            ],
          },
          {
            icon: <PieChart size={32} className="text-white" />,
            title: 'Content Marketing',
            description: 'Create compelling content that resonates with your target audience.',
            features: [
              'Blog writing & strategy',
              'Video production',
              'Infographic design',
              'Content distribution',
            ],
          },
          {
            icon: <Users size={32} className="text-white" />,
            title: 'Brand Strategy',
            description: 'Develop a strong brand identity that sets you apart from competition.',
            features: [
              'Brand positioning',
              'Logo & visual identity',
              'Messaging framework',
              'Brand guidelines',
            ],
          },
        ]}
      />

      <StatsSection
        stats={[
          { number: '150+', label: 'Happy Clients' },
          { number: '500%', label: 'Avg ROI Increase' },
          { number: '50M+', label: 'Impressions Generated' },
          { number: '12', label: 'Years of Experience' },
        ]}
      />

      <TeamSection
        title="Meet Our Team"
        subtitle="Expert marketers and strategists dedicated to your success"
        team={[
          {
            name: 'Sarah Johnson',
            role: 'CEO & Strategy Director',
            bio: 'Digital marketing visionary with 15 years of experience',
            image:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
            socials: {
              linkedin: 'https://linkedin.com',
              twitter: 'https://twitter.com',
            },
          },
          {
            name: 'Michael Chen',
            role: 'SEO & Content Lead',
            bio: 'Specializes in organic growth and content strategy',
            image:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            socials: {
              linkedin: 'https://linkedin.com',
              email: 'michael@example.com',
            },
          },
          {
            name: 'Emma Rodriguez',
            role: 'Social Media Manager',
            bio: 'Expert in building engaged online communities',
            image:
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            socials: {
              twitter: 'https://twitter.com',
            },
          },
          {
            name: 'David Park',
            role: 'Analytics Specialist',
            bio: 'Data-driven insights for marketing optimization',
            image:
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            socials: {
              linkedin: 'https://linkedin.com',
            },
          },
        ]}
      />

      <TestimonialsSection
        title="What Our Clients Say"
        subtitle="Real results and success stories from businesses we've helped grow"
        testimonials={[
          {
            quote:
              'Working with this team has been transformative. Our traffic increased by 300% in just 6 months.',
            author: 'John Smith',
            role: 'CEO',
            company: 'Tech Startup Inc',
            rating: 5,
          },
          {
            quote:
              'Their data-driven approach and strategic insights helped us optimize our campaigns like never before.',
            author: 'Lisa Wang',
            role: 'Marketing Director',
            company: 'Fashion Retail Co',
            rating: 5,
          },
          {
            quote:
              'The ROI we achieved exceeded our expectations. Highly recommend their services.',
            author: 'James Mitchell',
            role: 'Founder',
            company: 'E-commerce Solutions',
            rating: 5,
          },
          {
            quote:
              'Professional, responsive, and results-oriented. They truly understand our business goals.',
            author: 'Maria Garcia',
            role: 'VP Marketing',
            company: 'Global Services Ltd',
            rating: 5,
          },
          {
            quote:
              'The team brought fresh perspectives and innovative strategies that drove real growth.',
            author: 'Robert Johnson',
            role: 'Business Owner',
            company: 'Local Services',
            rating: 5,
          },
          {
            quote:
              'Exceptional service, transparent reporting, and measurable results. A true partner in our growth.',
            author: 'Amanda Lee',
            role: 'CEO',
            company: 'Digital Products',
            rating: 5,
          },
        ]}
      />

      <CTA
        title="Ready to Grow Your Business?"
        subtitle="Join 150+ successful companies that have transformed their marketing with our expert strategies and proven results."
        primaryButtonText="Schedule a Consultation"
        secondaryButtonText="View Our Portfolio"
        onPrimaryClick={() => {
          const element = document.getElementById('contact')
          element?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      <div id="contact">
        <ContactForm onSubmit={handleContactFormSubmit} />
      </div>

      <Footer
        companyName="Up Digital"
        description="A full-service digital marketing agency dedicated to helping businesses achieve their goals through data-driven strategies and innovative solutions."
        columns={[
          {
            title: 'Services',
            links: [
              { label: 'SEO & SEM', href: '#' },
              { label: 'Social Media', href: '#' },
              { label: 'Content Marketing', href: '#' },
              { label: 'Analytics', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About Us', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Careers', href: '#' },
              { label: 'Contact', href: '#' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'Case Studies', href: '#' },
              { label: 'Free Tools', href: '#' },
              { label: 'Webinars', href: '#' },
              { label: 'Documentation', href: '#' },
            ],
          },
        ]}
        socials={{
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          linkedin: 'https://linkedin.com',
          instagram: 'https://instagram.com',
        }}
      />
    </div>
  )
}

export default LandingPage
