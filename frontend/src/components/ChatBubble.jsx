export default function ChatBubble({ role="user", children }) {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div className={`${isUser ? "bg-sky-600 text-white" : "bg-neutral-200 dark:bg-neutral-800"} px-3 py-2 rounded-2xl max-w-[80%]`}>
        {children}
      </div>
    </div>
  );
}
