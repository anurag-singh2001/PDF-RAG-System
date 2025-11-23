// import FileUploadComponent from "./components/file-upload";
// import ChatComponent from "./components/chat";
// export default function Home() {
//   return (
//     <div>
//       <div className="min-h-screen w-screen flex ">
//         <div className="w-[30vw] min-h-screen p-4 flex justify-center items-center">
//           <FileUploadComponent />
//         </div>
//         <div className="w-[70vw] min-h-screen border-l-2">
//           <ChatComponent />
//         </div>

//       </div>
//     </div>
//   );
// }

import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <div className="flex min-h-screen w-screen">
      {/* Left panel: File Upload */}
      <div className="w-[30vw] flex justify-center items-center bg-slate-950 border-r border-slate-800 p-6">
        <FileUploadComponent />
      </div>

      {/* Right panel: Chat */}
      <div className="w-[70vw] bg-slate-50">
        <ChatComponent />
      </div>
    </div>
  );
}
