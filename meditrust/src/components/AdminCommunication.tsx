import React, { useState } from 'react';
import { MessageSquareLock, FileOutput, Megaphone, Plus, X, Pin, Trash2, Send } from 'lucide-react';
import { DataStore } from '../dataStore';
import { ChatChannel, DischargeSummary, BulletinPost } from '../types';

const categoryBadge: Record<BulletinPost['category'], string> = {
  'Trial Alert': 'bg-primary/10 text-primary border-primary/20',
  'Guideline Update': 'bg-secondary/10 text-secondary border-secondary/20',
  'Drug Recall': 'bg-red-50 text-red-700 border-red-100',
  General: 'bg-line/60 text-body border-line',
};

export default function AdminCommunication() {
  const [channels, setChannels] = useState<ChatChannel[]>(() => DataStore.getChatChannels());
  const [summaries, setSummaries] = useState<DischargeSummary[]>(() => DataStore.getDischargeSummaries());
  const [posts, setPosts] = useState<BulletinPost[]>(() => DataStore.getBulletinPosts());

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postCategory, setPostCategory] = useState<BulletinPost['category']>('General');

  const openChannel = (c: ChatChannel) => {
    DataStore.markChatChannelRead(c.id);
    setChannels(DataStore.getChatChannels());
  };

  const handleGenerateDischarge = () => {
    const patientName = window.prompt('Patient name for discharge summary:');
    if (!patientName) return;
    DataStore.addDischargeSummary({ patientName, doctorName: 'Dr. Alexander', date: new Date().toISOString().split('T')[0], status: 'Draft' });
    setSummaries(DataStore.getDischargeSummaries());
  };
  const handleTransmit = (s: DischargeSummary) => {
    DataStore.transmitDischargeSummary(s.id);
    DataStore.addAuditLog('Dr. Alexander', 'Transmitted discharge summary', `${s.patientName} (${s.id})`, 'General');
    setSummaries(DataStore.getDischargeSummaries());
  };

  const submitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    DataStore.addBulletinPost({ title: postTitle.trim(), body: postBody.trim(), category: postCategory, pinned: false, date: new Date().toISOString().split('T')[0] });
    setPosts(DataStore.getBulletinPosts());
    setPostModalOpen(false);
    setPostTitle(''); setPostBody(''); setPostCategory('General');
  };
  const togglePin = (id: string) => {
    DataStore.togglePinBulletinPost(id);
    setPosts(DataStore.getBulletinPosts());
  };
  const deletePost = (id: string) => {
    DataStore.deleteBulletinPost(id);
    setPosts(DataStore.getBulletinPosts());
  };

  const sortedPosts = [...posts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">Inter-Professional Communication</h2>
        <p className="text-sm text-body mt-1">Manage secure clinical channels, discharge transitions, and clinic-wide bulletins.</p>
      </div>

      {/* Secure Chat */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <MessageSquareLock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Encrypted Internal Channels</h3>
        </div>
        <div className="divide-y divide-line">
          {channels.map((c) => (
            <button key={c.id} onClick={() => openChannel(c)} className="w-full p-5 flex items-center justify-between gap-4 hover:bg-page/50 transition-colors text-left cursor-pointer">
              <div>
                <div className="text-sm font-bold text-heading">{c.name}</div>
                <div className="text-xs text-body/60 font-semibold mt-1">{c.members}</div>
                <p className="text-xs text-body font-medium mt-1.5">{c.lastMessage}</p>
              </div>
              <div className="text-right shrink-0">
                {c.unread > 0 && <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full mb-1.5">{c.unread} new</span>}
                <div className="text-[10px] text-body/60 font-bold">{c.lastMessageTime}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Discharge Summaries */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileOutput className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Discharge Summaries</h3>
          </div>
          <button onClick={handleGenerateDischarge} className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Generate Summary
          </button>
        </div>
        <div className="divide-y divide-line">
          {summaries.map((s) => (
            <div key={s.id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-heading">{s.patientName}</div>
                <div className="text-xs text-body/60 font-semibold mt-1">{s.doctorName} &middot; {s.date}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`status-chip ${s.status === 'Transmitted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{s.status}</span>
                {s.status === 'Draft' && (
                  <button onClick={() => handleTransmit(s)} className="px-3 py-2 rounded-[20px] border border-line hover:bg-page text-xs font-bold text-body inline-flex items-center gap-1.5 cursor-pointer">
                    <Send className="w-3.5 h-3.5" /> Transmit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bulletin Board */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Clinical Bulletin Board</h3>
          </div>
          <button onClick={() => setPostModalOpen(true)} className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> New Post
          </button>
        </div>
        <div className="divide-y divide-line">
          {sortedPosts.map((p) => (
            <div key={p.id} className="p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-heading flex items-center gap-2">
                  {p.pinned && <Pin className="w-3.5 h-3.5 text-primary fill-primary" />}
                  {p.title}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadge[p.category]}`}>{p.category}</span>
                </div>
                <p className="text-xs text-body font-medium mt-1.5 max-w-xl leading-relaxed">{p.body}</p>
                <div className="text-[11px] text-body/60 font-bold mt-1.5">{p.date}</div>
              </div>
              <div className="inline-flex gap-2 shrink-0">
                <button onClick={() => togglePin(p.id)} className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body/60 hover:text-primary transition-colors cursor-pointer">
                  <Pin className="w-4 h-4" />
                </button>
                <button onClick={() => deletePost(p.id)} className="p-1.5 rounded-[20px] border border-line hover:bg-red-50 text-body/60 hover:text-red-600 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Bulletin Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">Post Bulletin Announcement</h2>
              <button onClick={() => setPostModalOpen(false)} className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitPost} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Title</label>
                <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Category</label>
                <select value={postCategory} onChange={(e) => setPostCategory(e.target.value as BulletinPost['category'])} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all">
                  <option value="General">General</option>
                  <option value="Trial Alert">Clinical Trial Alert</option>
                  <option value="Guideline Update">Guideline Update</option>
                  <option value="Drug Recall">Drug Recall</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Message</label>
                <textarea value={postBody} onChange={(e) => setPostBody(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all resize-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-2">
                Publish to Bulletin Board
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
