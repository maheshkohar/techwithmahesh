import { useState, useEffect } from 'react';
import { Link } from '../context/RouterContext';
import { Button } from './ui';
import {
  Shield, Cpu, Camera, Network, Wifi, Server, ArrowRight, CheckCircle2,
  Star, Users, Clock, Award, Zap, Phone, Mail, MapPin, Menu, X,
  TrendingUp, Activity, Lock, Headphones, Wrench, Target
} from 'lucide-react';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm border-b border-slate-200/60 py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900">TechWith Mahesh</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('services')} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Services</button>
              <button onClick={() => scrollTo('process')} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Process</button>
              <button onClick={() => scrollTo('features')} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Features</button>
              <button onClick={() => scrollTo('testimonials')} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Reviews</button>
              <button onClick={() => scrollTo('contact')} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Contact</button>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/register"><Button size="sm">Get Started <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 space-y-1 animate-fade-in">
              <button onClick={() => { scrollTo('services'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Services</button>
              <button onClick={() => { scrollTo('process'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Process</button>
              <button onClick={() => { scrollTo('features'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Features</button>
              <button onClick={() => { scrollTo('testimonials'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Reviews</button>
              <button onClick={() => { scrollTo('contact'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Contact</button>
              <div className="flex gap-2 pt-3">
                <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Sign In</Button></Link>
                <Link to="/register" className="flex-1"><Button size="sm" className="w-full">Get Started</Button></Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                Trusted IT Solutions Provider
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                Secure Your World with <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Smart Technology</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                Professional CCTV installation, network infrastructure, and IT services. We deliver enterprise-grade security and connectivity solutions for businesses of all sizes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register"><Button size="lg" className="shadow-lg shadow-primary-600/25">Start Your Project <ArrowRight className="w-5 h-5" /></Button></Link>
                <Button variant="outline" size="lg" onClick={() => scrollTo('services')}>Explore Services</Button>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {['JD','MK','SL','AR'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">500+ happy clients</p>
                </div>
              </div>
            </div>

            {/* Dashboard preview mockup */}
            <div className="relative animate-scale-in">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60">
                <img src="/image copy copy.png" alt="TechWith Mahesh" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              </div>

              {/* Floating stat cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">99.9% Uptime</p>
                  <p className="text-xs text-slate-500">Guaranteed reliability</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-float border border-slate-100" style={{ animationDelay: '1s' }}>
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">24/7 Monitoring</p>
                  <p className="text-xs text-slate-500">Always protected</p>
                </div>
              </div>
              <div className="absolute top-1/2 -right-8 bg-white rounded-2xl shadow-xl p-3 animate-float border border-slate-100" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">+24% Growth</p>
                    <p className="text-[10px] text-slate-500">This quarter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by logos strip */}
      <section className="py-8 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider mb-6">Trusted by leading companies</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {['TechCorp', 'RetailMax', 'FinanceHub', 'CloudSys', 'DataPro', 'SecureNet'].map((name, i) => (
              <div key={i} className="font-display font-bold text-lg text-slate-300 hover:text-slate-400 transition-colors cursor-default">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '500+', label: 'Clients Served' },
              { icon: Camera, value: '1,200+', label: 'Installations' },
              { icon: Clock, value: '24/7', label: 'Support' },
              { icon: Award, value: '15+', label: 'Years Experience' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center mb-4 group-hover:bg-white/15 group-hover:scale-110 transition-all">
                  <stat.icon className="w-7 h-7 text-primary-400" />
                </div>
                <p className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
              <Wrench className="w-4 h-4" /> Our Expertise
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Comprehensive IT Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">From surveillance to infrastructure, we've got your business covered</p>
          </div>
          {/* Shared services photo */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 mb-10">
            <img src="/image copy copy.png" alt="Our IT Services" className="w-full h-72 object-cover" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: 'CCTV Installation', desc: 'HD & 4K surveillance camera systems with remote monitoring and cloud storage.', color: 'from-blue-500 to-cyan-500', features: ['4K Resolution', 'Night Vision', 'Mobile App'] },
              { icon: Network, title: 'Network Infrastructure', desc: 'Structured cabling, switches, routers, and complete network setup.', color: 'from-emerald-500 to-teal-500', features: ['10Gbps Speed', 'VLAN Setup', 'Redundancy'] },
              { icon: Wifi, title: 'WiFi Solutions', desc: 'Enterprise-grade wireless coverage for offices, warehouses, and campuses.', color: 'from-amber-500 to-orange-500', features: ['Mesh Network', '100% Coverage', 'Guest Access'] },
              { icon: Server, title: 'Server Setup', desc: 'On-premise and cloud server configuration, maintenance, and monitoring.', color: 'from-violet-500 to-purple-500', features: ['Cloud & On-Prem', 'Auto Backup', '24/7 Monitor'] },
              { icon: Shield, title: 'Access Control', desc: 'Biometric and card-based access control systems for secure facilities.', color: 'from-rose-500 to-pink-500', features: ['Biometric', 'Audit Logs', 'Remote Access'] },
              { icon: Cpu, title: 'IT Consulting', desc: 'Strategic technology planning and infrastructure optimization services.', color: 'from-sky-500 to-indigo-500', features: ['Strategy', 'Optimization', 'Support'] },
            ].map((service, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{service.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((f, j) => (
                    <span key={j} className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">{f}</span>
                  ))}
                </div>
                <Link to="/register" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
              <Target className="w-4 h-4" /> How It Works
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Our Simple 4-Step Process</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">From consultation to deployment, we make IT seamless</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Headphones, title: 'Consultation', desc: 'We assess your needs and recommend the best solutions for your business.' },
              { step: '02', icon: Target, title: 'Planning', desc: 'Detailed project scope, timeline, and budget planning with your approval.' },
              { step: '03', icon: Wrench, title: 'Installation', desc: 'Professional setup and configuration by our certified technicians.' },
              { step: '04', icon: CheckCircle2, title: 'Support', desc: 'Ongoing maintenance, monitoring, and 24/7 technical support.' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
                <Award className="w-4 h-4" /> Why Choose Us
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Choose TechWith Mahesh?</h2>
              <p className="text-lg text-slate-600 mb-8">We combine cutting-edge technology with years of expertise to deliver solutions that just work.</p>
              <div className="space-y-5">
                {[
                  { icon: CheckCircle2, title: 'Certified Professionals', desc: 'Our team holds industry certifications and undergoes continuous training.' },
                  { icon: Lock, title: 'Enterprise Security', desc: 'Bank-grade encryption and security protocols on every installation.' },
                  { icon: Clock, title: 'On-Time Delivery', desc: 'We respect your schedule and deliver projects on time, every time.' },
                  { icon: Award, title: 'Quality Guarantee', desc: 'All our work comes with a satisfaction guarantee and warranty.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                      <item.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Camera, label: 'Surveillance', value: '4K HD', color: 'text-blue-600 bg-blue-50' },
                { icon: Network, label: 'Network Speed', value: '10Gbps', color: 'text-emerald-600 bg-emerald-50' },
                { icon: Lock, label: 'Encryption', value: 'AES-256', color: 'text-rose-600 bg-rose-50' },
                { icon: Wifi, label: 'Coverage', value: '100%', color: 'text-amber-600 bg-amber-50' },
                { icon: Activity, label: 'Uptime', value: '99.9%', color: 'text-violet-600 bg-violet-50' },
                { icon: Headphones, label: 'Response', value: '< 1h', color: 'text-sky-600 bg-sky-50' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 text-center border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="font-display text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
              <Star className="w-4 h-4" /> Testimonials
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-3">What Our Clients Say</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Trusted by businesses across industries for reliable IT solutions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rajesh Kumar', role: 'CEO, TechCorp Solutions', text: 'TechWith Mahesh installed our entire CCTV system flawlessly. The team was professional, on-time, and the quality is outstanding.', rating: 5, initials: 'RK' },
              { name: 'Sarah Mitchell', role: 'Operations Manager, RetailMax', text: 'Their network infrastructure setup transformed our operations. We now have reliable connectivity across all our locations.', rating: 5, initials: 'SM' },
              { name: 'David Chen', role: 'IT Director, FinanceHub', text: 'The access control system they installed gives us peace of mind. Excellent service and great after-installation support.', rating: 5, initials: 'DC' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-shadow relative">
                <div className="absolute top-6 right-6 text-6xl text-primary-100 font-display font-bold leading-none">"</div>
                <div className="flex gap-0.5 mb-4 relative">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 leading-relaxed mb-5 relative">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 p-12 text-center overflow-hidden gradient-animate">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Secure Your Business?</h2>
              <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">Join hundreds of businesses that trust TechWith Mahesh for their IT and security needs.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register"><Button size="lg" className="bg-white text-primary-700 hover:bg-slate-100 shadow-xl">Get Started Today <ArrowRight className="w-5 h-5" /></Button></Link>
                <Button size="lg" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20" onClick={() => scrollTo('contact')}>Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
              <Mail className="w-4 h-4" /> Get In Touch
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Let's Talk About Your Project</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Reach out to us through any of these channels</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Call Us', value: '+1 (555) 123-4567', sub: 'Mon-Fri 9am-6pm', color: 'text-emerald-600 bg-emerald-50' },
              { icon: Mail, title: 'Email Us', value: 'contact@techwithmahesh.com', sub: 'We reply within 24h', color: 'text-primary-600 bg-primary-50' },
              { icon: MapPin, title: 'Visit Us', value: '123 Tech Avenue, Suite 100', sub: 'San Francisco, CA 94103', color: 'text-amber-600 bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`inline-flex w-14 h-14 rounded-2xl ${item.color} items-center justify-center mb-4`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-700 font-medium">{item.value}</p>
                <p className="text-sm text-slate-500 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-white">TechWith Mahesh</span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
                Professional IT and security solutions provider. We help businesses secure, connect, and optimize their operations with cutting-edge technology.
              </p>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xs font-medium">
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Services</h4>
              <ul className="space-y-2">
                {['CCTV Installation', 'Network Setup', 'WiFi Solutions', 'Access Control', 'IT Consulting'].map((s, i) => (
                  <li key={i}><button onClick={() => scrollTo('services')} className="text-sm text-slate-400 hover:text-white transition-colors">{s}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Our Process', 'Testimonials', 'Contact', 'Privacy Policy'].map((s, i) => (
                  <li key={i}><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-400">© 2026 TechWith Mahesh. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
