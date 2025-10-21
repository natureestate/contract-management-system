// ตัวอย่างการใช้งาน WebSocket กับ Cloudflare Durable Objects
// สำหรับ Real-time Communication

'use client';

import { useEffect, useState } from 'react';
import { getWebSocketClient } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
  sessionId?: string;
}

export default function WebSocketExample() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const ws = getWebSocketClient();

    // Handle connection
    const connectWS = async () => {
      try {
        await ws.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        setIsConnected(false);
      }
    };

    // Register message handlers
    ws.on('welcome', (data: Message) => {
      console.log('Welcome message:', data);
      setSessionId(data.sessionId || '');
      setMessages((prev) => [...prev, data]);
    });

    ws.on('message', (data: Message) => {
      console.log('Received message:', data);
      setMessages((prev) => [...prev, data]);
    });

    ws.on('pong', (data: Message) => {
      console.log('Pong received');
      setMessages((prev) => [...prev, { ...data, message: 'Pong received' }]);
    });

    ws.on('error', (data: Message) => {
      console.error('WebSocket error:', data);
      setMessages((prev) => [...prev, data]);
    });

    // Connect
    connectWS();

    // Cleanup
    return () => {
      ws.disconnect();
      setIsConnected(false);
    };
  }, []);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const ws = getWebSocketClient();
    ws.send('message', {
      text: inputMessage,
      senderId: sessionId || 'anonymous',
    });

    setInputMessage('');
  };

  const sendPing = () => {
    const ws = getWebSocketClient();
    ws.send('ping');
  };

  const reconnect = async () => {
    const ws = getWebSocketClient();
    try {
      await ws.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  };

  const disconnect = () => {
    const ws = getWebSocketClient();
    ws.disconnect();
    setIsConnected(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WebSocket Demo</CardTitle>
              <CardDescription>
                Real-time communication with Cloudflare Durable Objects
              </CardDescription>
            </div>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
          </div>
          {sessionId && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                Session ID: <code className="text-xs">{sessionId}</code>
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={reconnect}
              disabled={isConnected}
              variant="outline"
            >
              Connect
            </Button>
            <Button
              onClick={disconnect}
              disabled={!isConnected}
              variant="outline"
            >
              Disconnect
            </Button>
            <Button
              onClick={sendPing}
              disabled={!isConnected}
              variant="outline"
            >
              Send Ping
            </Button>
            <Button
              onClick={() => setMessages([])}
              variant="outline"
            >
              Clear Messages
            </Button>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            <Button onClick={sendMessage} disabled={!isConnected}>
              Send
            </Button>
          </div>

          {/* Messages Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No messages yet. Connect and send a message!
                    </p>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {msg.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {msg.message && (
                          <p className="text-sm">{msg.message}</p>
                        )}
                        {msg.data && (
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(msg.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h4 className="text-sm font-semibold mb-2">💡 How it works</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• WebSocket connects to Cloudflare Durable Object</li>
                <li>• Messages are broadcasted to all connected clients</li>
                <li>• Automatic reconnection on connection loss</li>
                <li>• Ping/Pong for keeping connection alive</li>
                <li>• Free tier: 1M requests/month</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

