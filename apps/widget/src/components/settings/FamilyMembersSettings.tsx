import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyMember {
  id: string;
  name: string;
  dietaryRestrictions: string[];
}

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export function FamilyMembersSettings() {
  const intl = useIntl();

  const [members, setMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Me', dietaryRestrictions: [] },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');

  const addMember = () => {
    if (!newName.trim()) return;
    setMembers([
      ...members,
      { id: crypto.randomUUID(), name: newName.trim(), dietaryRestrictions: [] },
    ]);
    setNewName('');
    setShowAddForm(false);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-secondary transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          <span>{intl.formatMessage({ id: 'settings.back', defaultMessage: 'Back' })}</span>
        </Link>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
        >
          + {intl.formatMessage({ id: 'common.add', defaultMessage: 'Add' })}
        </button>
      </motion.div>

      <motion.div {...fadeIn}>
        <h1 className="text-xl font-semibold text-primary">
          {intl.formatMessage({ id: 'settings.familyMembers', defaultMessage: 'Family Members' })}
        </h1>
        <p className="mt-1 text-sm text-tertiary">
          {intl.formatMessage({ id: 'settings.familyMembersHint', defaultMessage: 'Add people to plan meals for' })}
        </p>
      </motion.div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-xl border border-primary/30 bg-primary/5"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={intl.formatMessage({ id: 'settings.memberNamePlaceholder', defaultMessage: 'Name' })}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-subtle bg-surface focus:border-primary focus:outline-none"
                autoFocus
              />
              <button
                onClick={addMember}
                disabled={!newName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg transition-colors"
              >
                {intl.formatMessage({ id: 'common.add', defaultMessage: 'Add' })}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-tertiary hover:text-secondary rounded-lg transition-colors"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-subtle bg-surface"
          >
            <div className="size-9 flex items-center justify-center bg-primary/10 text-primary rounded-full font-medium text-sm">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">{member.name}</p>
              <p className="text-xs text-tertiary">
                {member.dietaryRestrictions.length > 0
                  ? member.dietaryRestrictions.join(', ')
                  : intl.formatMessage({ id: 'settings.noRestrictions', defaultMessage: 'No restrictions' })}
              </p>
            </div>
            {member.id !== '1' && (
              <button
                onClick={() => removeMember(member.id)}
                className="p-1.5 text-tertiary hover:text-red-500 rounded-lg transition-colors"
              >
                <TrashIcon className="size-4" />
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}
