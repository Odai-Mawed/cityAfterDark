import { useImperativeHandle, useRef, type ComponentType, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewProps } from 'react-native-webview';

// react-native-webview's class typings don't play well with React 19's JSX types
const WebViewView = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebView> }>;

export interface MapSurfaceHandle {
  post: (json: string) => void;
}

interface Props {
  html: string;
  onMessage: (raw: string) => void;
  ref?: Ref<MapSurfaceHandle>;
}

/** iOS / Android: Leaflet runs inside a WebView. */
export function MapSurface({ html, onMessage, ref }: Props) {
  const web = useRef<WebView>(null);
  useImperativeHandle(ref, () => ({
    post: (json: string) => {
      web.current?.injectJavaScript(`window.__cadReceive && window.__cadReceive(${JSON.stringify(json)}); true;`);
    },
  }));
  return (
    <WebViewView
      ref={web}
      style={styles.map}
      originWhitelist={['*']}
      source={{ html, baseUrl: 'https://cityafterdark.local/' }}
      onMessage={(e) => onMessage(e.nativeEvent.data)}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      overScrollMode="never"
      bounces={false}
      setSupportMultipleWindows={false}
      // links inside the map (attribution) should not navigate the WebView
      onShouldStartLoadWithRequest={(req) => req.url.startsWith('https://cityafterdark.local') || req.url === 'about:blank'}
    />
  );
}

const styles = StyleSheet.create({ map: { flex: 1, backgroundColor: '#0b0b14' } });
