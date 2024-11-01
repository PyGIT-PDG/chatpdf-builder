import { useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { Document, Page, Text, View, PDFViewer, StyleSheet, Font } from '@react-pdf/renderer';

interface PDFPreviewProps {
  messages: ChatMessage[];
}

// Register a font
Font.register({
  family: 'Inter',
  src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    backgroundColor: '#EBF8FF',
  },
  systemMessage: {
    backgroundColor: '#F7FAFC',
  },
  timestamp: {
    fontSize: 10,
    color: '#718096',
    marginTop: 5,
  },
});

const PDFPreview = ({ messages }: PDFPreviewProps) => {
  return (
    <PDFViewer className="w-full h-full">
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