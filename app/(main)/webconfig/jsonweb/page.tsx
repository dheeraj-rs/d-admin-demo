'use client';
import dynamic from 'next/dynamic';
const Maintenance = dynamic(() => import('../../../../components/error-pages/maintenance'), {
    ssr: false,
});
export default function MaintenancePage() {
    return <Maintenance />;
}

// "use client";

// import { useState, useEffect } from 'react';
// import { ScrollArea } from '../../../../components/sample/ScrollArea/ScrollArea';
// import { Input } from '../../../../components/sample/Input/Input';
// import { Label } from '../../../../components/sample/Label/Label';
// import Card from '../../../../components/sample/Card/Card';
// import Toast from '../../../../components/sample/Toast/Toast';
// import { useRef } from 'react';
// import { ContentService } from '../../../../lib/content-service';
// import Link from 'next/link';
// import { ToastRef } from '../../../../types';
// interface ContentSection {
//   title: string;
//   fields: {
//     key: string;
//     label: string;
//     type: 'text' | 'textarea' | 'array' | 'object' | 'image' | 'social' | 'stats';
//     arrayType?: 'simple' | 'complex';
//   }[];
// }

// const contentSections: ContentSection[] = [
//   {
//     title: 'Header',
//     fields: [
//       { key: 'header.logo', label: 'Logo Text', type: 'text' },
//       { key: 'header.navigation', label: 'Navigation Items', type: 'array', arrayType: 'complex' }
//     ]
//   },
//   {
//     title: 'Hero',
//     fields: [
//       { key: 'hero.title', label: 'Title', type: 'text' },
//       { key: 'hero.subtitle', label: 'Subtitle', type: 'text' },
//       { key: 'hero.description', label: 'Description', type: 'textarea' },
//       { key: 'hero.image', label: 'Background Image URL', type: 'text' },
//       { key: 'hero.cta.primary.text', label: 'Primary CTA Text', type: 'text' },
//       { key: 'hero.cta.primary.href', label: 'Primary CTA Link', type: 'text' },
//       { key: 'hero.cta.secondary.text', label: 'Secondary CTA Text', type: 'text' },
//       { key: 'hero.cta.secondary.href', label: 'Secondary CTA Link', type: 'text' }
//     ]
//   },
//   {
//     title: 'About',
//     fields: [
//       { key: 'about.title', label: 'Title', type: 'text' },
//       { key: 'about.subtitle', label: 'Subtitle', type: 'text' },
//       { key: 'about.description', label: 'Description', type: 'textarea' },
//       { key: 'about.image', label: 'Image URL', type: 'text' },
//       { key: 'about.stats', label: 'Statistics', type: 'stats' }
//     ]
//   },
//   {
//     title: 'Services',
//     fields: [
//       { key: 'services.title', label: 'Title', type: 'text' },
//       { key: 'services.subtitle', label: 'Subtitle', type: 'text' },
//       { key: 'services.items', label: 'Service Items', type: 'array', arrayType: 'complex' }
//     ]
//   },
//   {
//     title: 'Team',
//     fields: [
//       { key: 'team.title', label: 'Title', type: 'text' },
//       { key: 'team.subtitle', label: 'Subtitle', type: 'text' },
//       { key: 'team.members', label: 'Team Members', type: 'array', arrayType: 'complex' }
//     ]
//   },
//   {
//     title: 'Contact',
//     fields: [
//       { key: 'contact.title', label: 'Title', type: 'text' },
//       { key: 'contact.subtitle', label: 'Subtitle', type: 'text' },
//       { key: 'contact.description', label: 'Description', type: 'textarea' },
//       { key: 'contact.email', label: 'Email', type: 'text' },
//       { key: 'contact.phone', label: 'Phone', type: 'text' },
//       { key: 'contact.address', label: 'Address', type: 'text' },
//       { key: 'contact.social', label: 'Social Links', type: 'social' }
//     ]
//   },
//   {
//     title: 'Footer',
//     fields: [
//         { key: 'footer.copyright', label: 'Copyright', type: 'text' },
//         { key: 'footer.links', label: 'Links', type: 'array', arrayType: 'complex' },
//         { key: 'footer.social', label: 'Social Links', type: 'social' },
//         { key: 'footer.logo', label: 'Logo', type: 'image' }
//     ]
//     } 
// ];

// export default function ContentEditor() {
//   const [content, setContent] = useState<any>(null);
//   const [activeSection, setActiveSection] = useState('header');
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const toast = useRef<ToastRef>(null);

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         setIsLoading(true);
//         const data = await ContentService.getContentData();
//         setContent(data);
//         setError(null);
//       } catch (err) {
//         console.error('Error loading content:', err);
//         setError('Failed to load content');
//         toast.current?.show({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Failed to load content',
//           life: 3000
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchContent();
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-lg">Loading content...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-red-500 text-lg">{error}</div>
//       </div>
//     );
//   }

//   const updateContent = (path: string, value: any) => {
//     const keys = path.split('.');
//     const newContent = { ...content };
//     let current = newContent;
    
//     for (let i = 0; i < keys.length - 1; i++) {
//       if (!current[keys[i]]) current[keys[i]] = {};
//       current = current[keys[i]];
//     }
//     current[keys[keys.length - 1]] = value;
//     setContent(newContent);
//   };

//   const renderArrayField = (field: any, parentKey: string) => {
//     const arrayData = field.key.split('.').reduce((obj: any, key: string) => obj?.[key], content) || [];
    
//     return (
//       <div className="space-y-4">
//         {arrayData.map((item: any, index: number) => (
//           <Card key={index} className="p-4">
//             {field.arrayType === 'complex' ? (
//               Object.keys(item).map((key) => (
//                 <div key={key} className="mb-4">
//                   <Label className="capitalize">{key}</Label>
//                   <Input
//                     value={item[key]}
//                     onChange={(e) => {
//                       const newArray = [...arrayData];
//                       newArray[index] = { ...newArray[index], [key]: e.target.value };
//                       updateContent(field.key, newArray);
//                     }}
//                   />
//                 </div>
//               ))
//             ) : (
//               <Input
//                 value={item}
//                 onChange={(e) => {
//                   const newArray = [...arrayData];
//                   newArray[index] = e.target.value;
//                   updateContent(field.key, newArray);
//                 }}
//               />
//             )}
//           </Card>
//         ))}
//         <button
//           onClick={() => {
//             const newItem = field.arrayType === 'complex' 
//               ? { label: 'New Item', href: '#' }
//               : '';
//             updateContent(field.key, [...arrayData, newItem]);
//           }}
//           className="w-full"
//         >
//           Add Item
//           </button>
//       </div>
//     );
//   };

//   const renderField = (field: any) => {
//     switch (field.type) {
//       case 'text':
//         return (
//           <Input
//             value={field.key.split('.').reduce((obj: any, key: string) => obj?.[key], content) || ''}
//             onChange={(e) => updateContent(field.key, e.target.value)}
//           />
//         );
//       case 'textarea':
//         return (
//           <textarea
//             className="w-full p-2 border rounded-md"
//             rows={4}
//             value={field.key.split('.').reduce((obj: any, key: string) => obj?.[key], content) || ''}
//             onChange={(e) => updateContent(field.key, e.target.value)}
//           />
//         );
//       case 'array':
//         return renderArrayField(field, field.key);
//       case 'stats':
//         return renderArrayField(
//           { key: `${field.key}`, arrayType: 'complex' },
//           field.key
//         );
//       case 'social':
//         return renderArrayField(
//           { key: `${field.key}`, arrayType: 'complex' },
//           field.key
//         );
//       default:
//         return null;
//     }
//   };

//   const handleSave = async () => {
//     try {
//       await ContentService.saveContentData(content);
//       toast.current?.show({
//         severity: 'success',
//         summary: 'Success',
//         detail: 'Content updated successfully',
//         life: 3000
//       });
//     } catch (error) {
//       toast.current?.show({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'Failed to save content',
//         life: 3000
//       });
//     }
//   };

//   if (!content) return null;

//   return (
//     <>
//       <Toast ref={toast} />
      
//       <div className="grid">
//         {/* Sidebar */}
//         <div className="col-12 md:col-3 lg:col-2">
//           <Card className="h-full shadow-sm">
//             <h2 className="text-xl font-semibold mb-4">Sections</h2>
//             <ScrollArea className="h-[calc(100vh-12rem)]">
//               <div className="flex flex-column gap-2">
//                 {contentSections.map((section) => (
//                     <button
//                     key={section.title.toLowerCase()}
//                     type="button"
//                     className={`button-component button--${activeSection === section.title.toLowerCase() ? 'secondary' : 'ghost'}`}
//                     onClick={() => setActiveSection(section.title.toLowerCase())}
//                   >
//                     {section.title}
//                   </button>
//                 ))}
//               </div>
//             </ScrollArea>
//           </Card>
//         </div>

//         {/* Main Content */}
//         <div className="col-12 md:col-9 lg:col-10">
//           <Card className="h-full shadow-sm">
//             <div className="w-full flex justify-between items-center mb-6 pb-3 gap-2 border-bottom-1 surface-border">
//               <h1 className="text-2xl font-bold m-0 ">
//                 {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Content
//               </h1>
//               <button type="button" onClick={handleSave}>Save Changes</button>  
//               <Link href="/landing" className="text-xl font-bold m-0 p-2 border-2 border-blue-500 custom-button--rounded">Preview</Link>
//             </div>

//             <ScrollArea className="h-[calc(100vh-14rem)]">
//               <div className="grid">
//                 {contentSections
//                   .find(section => section.title.toLowerCase() === activeSection)
//                   ?.fields.map((field) => (
//                     <div key={field.key} className="col-12 md:col-6 lg:col-4 p-3">
//                       <div className="field">
//                         <Label className="block mb-2">{field.label}</Label>
//                         {renderField(field)}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             </ScrollArea>
//           </Card>
//         </div>
//       </div>
//     </>
//   );
// } 