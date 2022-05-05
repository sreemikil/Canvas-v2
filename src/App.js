import React, { useEffect, useState, useRef, useCallback } from 'react';
import Excalidraw, {
  exportToCanvas,
  exportToSvg,
  exportToBlob,
} from '@excalidraw/excalidraw';
import InitialData from './initialData';


import './App.scss';

const resolvablePromise = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

export default function App() {
  const excalidrawRef = useRef(null);

  
  const [theme, setTheme] = useState('light');

  const initialStatePromiseRef = useRef({ promise: null });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/rocket.jpeg');
      const imageData = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(imageData);

      reader.onload = function () {
        const imagesArray = [
          {
            id: 'rocket',
            dataURL: reader.result,
            mimeType: 'image/jpeg',
            created: 1644915140367,
          },
        ];

        initialStatePromiseRef.current.promise.resolve(InitialData);
        excalidrawRef.current.addFiles(imagesArray);
      };
    };
    fetchData();

    const onHashChange = () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const libraryUrl = hash.get('addLibrary');
      if (libraryUrl) {
        excalidrawRef.current.importLibrary(libraryUrl, hash.get('token'));
      }
    };
    window.addEventListener('hashchange', onHashChange, false);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const updateScene = () => {
    const sceneData = {
      elements: [
        {
          type: 'rectangle',
          version: 141,
          versionNonce: 361174001,
          isDeleted: false,
          id: 'oDVXy8D6rom3H1-LLH2-f',
          fillStyle: 'hachure',
          strokeWidth: 1,
          strokeStyle: 'solid',
          roughness: 1,
          opacity: 100,
          angle: 0,
          x: 100.50390625,
          y: 93.67578125,
          strokeColor: '#c92a2a',
          backgroundColor: 'transparent',
          width: 186.47265625,
          height: 141.9765625,
          seed: 1968410350,
          groupIds: [],
        },
      ],
      appState: {
        viewBackgroundColor: '#edf2ff',
      },
    };
    excalidrawRef.current.updateScene(sceneData);
  };

  const onLinkOpen = useCallback((element, event) => {
    const link = element.link;
    const { nativeEvent } = event.detail;
    const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const isNewWindow = nativeEvent.shiftKey;
    const isInternalLink =
      link.startsWith('/') || link.includes(window.location.origin);
    if (isInternalLink && !isNewTab && !isNewWindow) {
      // signal that we're handling the redirect ourselves
      event.preventDefault();
      // do a custom redirect, such as passing to react-router
      // ...
    }
  }, []);

  return (
    <div className='App'>
      <h1>Canvas</h1>
      
        <div className='button-wrapper'>
          
          <button
            className='reset-scene'
            onClick={() => {
              excalidrawRef.current.resetScene();
            }}
          >
            Reset Scene
          </button>
        </div>
        <div className='excalidraw-wrapper'>
          <Excalidraw
            ref={excalidrawRef}
            initialData={initialStatePromiseRef.current.promise}
            onChange={(elements, state) =>
              console.info('Elements :', elements, 'State : ', state)
            }
            onPointerUpdate={(payload) => console.info(payload)}
            onCollabButtonClick={() =>
              window.alert('You clicked on collab button')
            }
            theme={theme}
            name='Custom name of drawing'
            UIOptions={{ canvasActions: { loadScene: false } }}
          />
        </div>
     
    </div>
  );
}
