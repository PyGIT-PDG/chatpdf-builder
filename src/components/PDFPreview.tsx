import type { ChatMessage } from '@/lib/types';
import { Document, Page, Text, View, PDFViewer, StyleSheet, Font } from '@react-pdf/renderer';

interface PDFPreviewProps {
  messages: ChatMessage[];
}

Font.register({
  family: 'Inter',
  src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    backgroundColor: '#2563eb',
  },
  systemMessage: {
    backgroundColor: '#374151',
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 5,
  },
});

const PDFPreview = ({ messages }: PDFPreviewProps) => {
  return (
    <PDFViewer className="w-full h-full dark:bg-gray-900">
      <Document>
        <Page size="A4" style={styles.page}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.message,
                message.type === 'user' ? styles.userMessage : styles.systemMessage,
              ]}
            >
              <Text>{message.content}</Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default PDFPreview;