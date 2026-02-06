import { snapshotTest } from "@cliffy/testing"
import { membersCommand } from "../../../src/commands/team/team-members.ts"
import {
  commonDenoArgs,
  setupMockLinearServer,
} from "../../utils/test-helpers.ts"

await snapshotTest({
  name: "Team Members Command - Help Text",
  meta: import.meta,
  colors: false,
  args: ["--help"],
  denoArgs: commonDenoArgs,
  async fn() {
    await membersCommand.parse()
  },
})

await snapshotTest({
  name: "Team Members Command - Team Members Only Active By Default",
  meta: import.meta,
  colors: false,
  args: ["ENG"],
  denoArgs: commonDenoArgs,
  async fn() {
    const { cleanup } = await setupMockLinearServer([
      {
        queryName: "GetTeamMembers",
        variables: {
          teamKey: "ENG",
          first: 100,
          after: undefined,
        },
        response: {
          data: {
            team: {
              members: {
                nodes: [
                  {
                    id: "user-1",
                    name: "Alice Johnson",
                    displayName: "alice",
                    email: "alice@example.com",
                    active: true,
                    initials: "AJ",
                    description: "Engineering",
                    timezone: "America/New_York",
                    lastSeen: null,
                    statusEmoji: null,
                    statusLabel: null,
                    guest: false,
                    isAssignable: true,
                    admin: false,
                    owner: false,
                    isMe: false,
                  },
                  {
                    id: "user-2",
                    name: "Bob Smith",
                    displayName: "bob",
                    email: "bob@example.com",
                    active: false,
                    initials: "BS",
                    description: null,
                    timezone: null,
                    lastSeen: null,
                    statusEmoji: null,
                    statusLabel: null,
                    guest: false,
                    isAssignable: true,
                    admin: false,
                    owner: false,
                    isMe: false,
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          },
        },
      },
    ])

    try {
      await membersCommand.parse()
    } finally {
      await cleanup()
    }
  },
})

await snapshotTest({
  name: "Team Members Command - Organization Members",
  meta: import.meta,
  colors: false,
  args: ["--organization", "--all"],
  denoArgs: commonDenoArgs,
  async fn() {
    const { cleanup } = await setupMockLinearServer([
      {
        queryName: "GetOrganizationMembers",
        variables: {
          includeDisabled: true,
          first: 100,
          after: undefined,
        },
        response: {
          data: {
            viewer: {
              organization: {
                users: {
                  nodes: [
                    {
                      id: "user-1",
                      name: "Alice Johnson",
                      displayName: "alice",
                      email: "alice@example.com",
                      active: true,
                      initials: "AJ",
                      description: "Staff Engineer",
                      timezone: "America/New_York",
                      lastSeen: null,
                      statusEmoji: null,
                      statusLabel: null,
                      guest: false,
                      isAssignable: true,
                      admin: true,
                      owner: true,
                      isMe: true,
                    },
                    {
                      id: "user-2",
                      name: "External Guest",
                      displayName: "guest-user",
                      email: "guest@example.com",
                      active: false,
                      initials: "EG",
                      description: null,
                      timezone: null,
                      lastSeen: null,
                      statusEmoji: null,
                      statusLabel: null,
                      guest: true,
                      isAssignable: false,
                      admin: false,
                      owner: false,
                      isMe: false,
                    },
                  ],
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: null,
                  },
                },
              },
            },
          },
        },
      },
    ])

    try {
      await membersCommand.parse()
    } finally {
      await cleanup()
    }
  },
})
