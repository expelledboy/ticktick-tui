import { afterAll, expect, test } from "bun:test";
import { addMockData, resetMocks } from "./api.mock";
import api from "./api";

test("should use mock api", async () => {
  addMockData(
    [
      {
        id: "1",
        name: "Test Project",
        color: "#000000",
      },
    ],
    [
      {
        id: "1",
        title: "Test Task",
        projectId: "1",
        status: 0,
      },
    ]
  );

  const task = await api.getTask("1", "1");
  expect(task.title).toEqual("Test Task");
});

afterAll(() => {
  resetMocks();
});
