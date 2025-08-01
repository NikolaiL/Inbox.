import { Button, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";

export const SelectConversation = () => {
  const navigate = useNavigate();
  return (
    <Stack gap={60} p="md" align="center">
      <Stack gap="lg" align="center">
        <Title order={3}>No conversation selected</Title>
        <Text>
          Select a conversation in the left sidebar to display its messages,
          or...
        </Text>
        <Stack gap="xs">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              void navigate("/conversations/new-group");
            }}>
            Create a new group
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              void navigate("/conversations/new-dm");
            }}>
            Create a new direct message
          </button>
        </Stack>
      </Stack>
    </Stack>
  );
};
