import { Group } from "@mantine/core";
import {
  Group as XmtpGroup,
  type Client,
  type Conversation as XmtpConversation,
} from "@xmtp/browser-sdk";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Outlet, useOutletContext } from "react-router";
import { ConversationMenu } from "@/components/Conversation/ConversationMenu";
import { Messages } from "@/components/Messages/Messages";
import { ConversationProvider } from "@/contexts/ConversationContext";
import type { ContentTypes } from "@/contexts/XMTPContext";
import { useConversation } from "@/hooks/useConversation";
import { ContentLayout } from "@/layouts/ContentLayout";
import { Composer } from "./Composer";

export type ConversationProps = {
  conversation: XmtpConversation<ContentTypes>;
};

export const Conversation: React.FC<ConversationProps> = ({ conversation }) => {
  const { client } = useOutletContext<{ client: Client<ContentTypes> }>();
  const [title, setTitle] = useState("");
  const {
    messages,
    getMessages,
    loading: conversationLoading,
    syncing: conversationSyncing,
    streamMessages,
  } = useConversation(conversation);
  const stopStreamRef = useRef<(() => void) | null>(null);

  const startStream = useCallback(async () => {
    stopStreamRef.current = await streamMessages();
  }, [streamMessages]);

  const stopStream = useCallback(() => {
    stopStreamRef.current?.();
    stopStreamRef.current = null;
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      stopStream();
      await getMessages(undefined, true);
      await startStream();
    };
    void loadMessages();
    return () => {
      stopStream();
    };
  }, [conversation.id]);

  const handleSync = useCallback(async () => {
    stopStream();
    await getMessages(undefined, true);
    await startStream();
    if (conversation instanceof XmtpGroup) {
      setTitle(conversation.name || "Untitled");
    }
  }, [getMessages, conversation.id, startStream, stopStream]);

  useEffect(() => {
    if (conversation instanceof XmtpGroup) {
      setTitle(conversation.name || "Untitled");
    } else {
      setTitle("Direct message");
    }
  }, [conversation.id]);

  const memoizedMessages = useMemo(() => messages, [messages]);

  return (
    <>
      <ContentLayout
        title={title}
        loading={conversationLoading}
        headerActions={
          <Group gap="xs">
            <ConversationMenu
              type={conversation instanceof XmtpGroup ? "group" : "dm"}
              onSync={() => void handleSync()}
              disabled={conversationSyncing}
            />
          </Group>
        }
        footer={<Composer conversation={conversation} />}
        withScrollArea={false}>
        <ConversationProvider conversation={conversation}>
          <Messages messages={memoizedMessages} />
        </ConversationProvider>
      </ContentLayout>
      <Outlet context={{ conversation, client }} />
    </>
  );
};
