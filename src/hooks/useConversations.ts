import type {
  Conversation,
  Identifier,
  SafeCreateGroupOptions,
  SafeListConversationsOptions,
} from "@xmtp/browser-sdk";
import { useState } from "react";
import { useXMTP, type ContentTypes } from "@/contexts/XMTPContext";

export const useConversations = () => {
  const { client } = useXMTP();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [conversations, setConversations] = useState<
    Conversation<ContentTypes>[]
  >([]);

  if (!client) {
    return {
      conversations: [],
      getConversationById: async () => undefined,
      getMessageById: async () => undefined,
      list: async () => [],
      loading: true,
      newDm: async () => undefined,
      newDmWithIdentifier: async () => undefined,
      newGroup: async () => undefined,
      newGroupWithIdentifiers: async () => undefined,
      stream: async () => undefined,
      sync: async () => undefined,
      syncAll: async () => undefined,
      syncing: true,
    };
  }

  const list = async (
    options?: SafeListConversationsOptions,
    syncFromNetwork: boolean = false,
  ) => {
    if (syncFromNetwork) {
      await sync();
    }

    setLoading(true);

    try {
      const convos = await client.conversations.list(options);
      console.log('[useConversations] list fetched', convos.length, 'conversations:', convos.map(c => c.id));
      setConversations(convos);
      return convos;
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    setSyncing(true);

    try {
      await client.conversations.sync();
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    setSyncing(true);

    try {
      await client.conversations.syncAll();
    } finally {
      setSyncing(false);
    }
  };

  const getConversationById = async (conversationId: string) => {
    setLoading(true);

    try {
      const conversation =
        await client.conversations.getConversationById(conversationId);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const getMessageById = async (messageId: string) => {
    setLoading(true);

    try {
      const message = await client.conversations.getMessageById(messageId);
      return message;
    } finally {
      setLoading(false);
    }
  };

  const newGroup = async (
    inboxIds: string[],
    options?: SafeCreateGroupOptions,
  ) => {
    setLoading(true);

    try {
      const conversation = await client.conversations.newGroup(
        inboxIds,
        options,
      );
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newGroupWithIdentifiers = async (
    identifiers: Identifier[],
    options?: SafeCreateGroupOptions,
  ) => {
    setLoading(true);

    try {
      const conversation = await client.conversations.newGroupWithIdentifiers(
        identifiers,
        options,
      );
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newDm = async (inboxId: string) => {
    setLoading(true);

    try {
      const conversation = await client.conversations.newDm(inboxId);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newDmWithIdentifier = async (identifier: Identifier) => {
    setLoading(true);

    try {
      const conversation =
        await client.conversations.newDmWithIdentifier(identifier);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const stream = async () => {
    const onConversation = (
      error: Error | null,
      conversation: Conversation<ContentTypes> | undefined,
    ) => {
      if (conversation) {
        const shouldAdd =
          conversation.metadata?.conversationType === "dm" ||
          conversation.metadata?.conversationType === "group";
        if (shouldAdd) {
          console.log('[useConversations] stream received conversation:', conversation.id, conversation);
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === conversation.id);
            if (exists) {
              console.log('[useConversations] stream: conversation already exists, skipping add:', conversation.id);
              return prev;
            }
            const updated = [conversation, ...prev];
            console.log('[useConversations] stream: updated conversations list:', updated.map(c => c.id));
            return updated;
          });
        }
      }
    };

    const stream = await client.conversations.stream(onConversation);

    return () => {
      void stream.return(undefined);
    };
  };

  return {
    conversations,
    getConversationById,
    getMessageById,
    list,
    loading,
    newDm,
    newDmWithIdentifier,
    newGroup,
    newGroupWithIdentifiers,
    stream,
    sync,
    syncAll,
    syncing,
  };
};
