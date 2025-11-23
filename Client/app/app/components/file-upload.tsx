// 'use client'

// import * as React from 'react';
// import {Upload} from 'lucide-react';
// const FileUploadComponent: React.FC = ()=>{

//     const handleFileUploadButtonClick = () =>{
//         const el = document.createElement('input');
//         el.setAttribute('type', 'file');
//         el .setAttribute('accept', 'application/pdf');
//         el.addEventListener('change',async (ev) => {
//             if(el.files && el.files.length > 0){
//                 const file = el.files.item(0)
//                 console.log("Selected file",file?.name);
//                 if(file){
//                     const formData = new FormData();
//                     formData.append('pdf',file);
//                     await fetch('http://localhost:8000/upload/pdf',{
//                         method: 'POST',
//                         body: formData
//                     });
//                     console.log("File uploaded successfully");
//                 }
//             }
           
//         });
//         el.click();
//     };

//     return (
//         <div className="bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-white border-2" > 
//             <div
//                 onClick={handleFileUploadButtonClick}
//                 className="flex justify-center items-center flex-col"
//             >
//                 <h3>Upload PDF File</h3>
//                 <Upload />
//             </div>
            

//         </div>
//     );
// };

// export default FileUploadComponent;


'use client'

import * as React from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FileUploadComponent: React.FC = () => {

  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');

    el.addEventListener('change', async () => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          console.log("Selected file:", file.name);
          const formData = new FormData();
          formData.append('pdf', file);

          await fetch('http://localhost:8000/upload/pdf', {
            method: 'POST',
            body: formData,
          });

          console.log("File uploaded successfully");
        }
      }
    });

    el.click();
  };

  return (
    <Card className="bg-slate-900 text-white border border-slate-700 shadow-xl w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          Upload PDF File
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <Upload className="w-10 h-10 text-slate-400" />
        <Button
        variant="secondary"
        onClick={handleFileUploadButtonClick}
        className="bg-white text-black hover:bg-slate-200 transition"
      >
          Choose File
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploadComponent;
