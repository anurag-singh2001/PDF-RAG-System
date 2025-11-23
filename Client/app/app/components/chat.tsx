// 'use client'

// import * as React from 'react';
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// interface Doc {
//     pageContent?: string;
//     metdata?: {
//         loc?:{
//             pageNumber?: number;
//         };
//         source?: string;
//     }; 
// }

// interface IMessage{
//     role: 'assistant' | 'user';
//     content: string;
//     documents?: Doc[];
// }

// const ChatComponent: React.FC = () => {

//     const [message, setMessage] = React.useState<string>('');
//     const [messages, setMessages] = React.useState<IMessage[]>([]);

//      console.log({ messages });

//     const handleSendChatMessage = async() => {

//         setMessages((prev) => [...prev,{role: 'user', content: message}]);
//         const res = await fetch(`http://localhost:8000/chat?message=${message}`);
//         const data = await res.json()
//         console.log(data);

//         setMessages((prev)=>[
//             ...prev,
//             {role: 'assistant', content: data?.answer, documents: data?.sources},
//         ]);
//         setMessage('');

//     }


//     return (
//         <div className="p-4">
//       <div>
//         {messages.map((message, index) => (
//           <pre key={index}>{JSON.stringify(message, null, 2)}</pre>
//         ))}
//       </div>
//       <div className="fixed bottom-4 w-100 flex gap-3">
//         <Input
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your message here"
//         />
//         <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
//           Send
//         </Button>
//       </div>
//     </div>
//     );
// };

// export default ChatComponent;

'use client'

import * as React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Doc {
  index?: number;
  source?: string;
  page?: number;
  preview?: string;
}

interface IMessage {
  role: 'assistant' | 'user';
  content: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);

    try {
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.answer,
          documents: data?.sources,
        },
      ]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
    } finally {
      setMessage('');
    }
  };

  return (
    <div className="bg-slate-900 flex flex-col h-screen">
      <Card className="flex flex-col flex-1 rounded-none border-0">
        <CardContent className="flex flex-col flex-1 p-0">
          {/* Scrollable message area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg px-4 py-2 rounded-2xl shadow-md whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    {msg.content}

                    {/* Optional document sources */}
                    {msg.documents?.length ? (
                      <div className="mt-2 text-xs text-slate-600 border-t border-slate-300 pt-2">
                        <strong>Sources:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {msg.documents.map((doc, i) => (
                            <li key={i}>
                              <span className="font-medium">{doc.source}</span> (p.{doc.page}) — {doc.preview?.slice(0, 80)}...
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message input bar */}
          <div className="border-t p-4 flex items-center gap-3 bg-white">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
            />
            <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatComponent;
