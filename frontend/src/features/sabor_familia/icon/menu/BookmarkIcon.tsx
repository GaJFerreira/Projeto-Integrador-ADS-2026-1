const BookmarkIcon = ({ active }: { active: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#BA7517" : "none"} stroke={active ? "#BA7517" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );

export default BookmarkIcon;
