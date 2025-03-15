import { describe, test, expect, mock } from "bun:test";
import React from "react";
import { Box, Text } from "ink";
import { createTestHelper, waitForCondition } from "../../tests/testhelper";
import { createPropsController } from "../../tests/utils";
import FocusList from "./FocusList";

// Define the test item type
interface TestItem {
  id: string;
  name: string;
  value: number;
}

// Define custom item type
interface CustomIdItem {
  customId: string;
  name: string;
}

// Create test items for our list
const createTestItems = (count = 3): TestItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
    value: i + 1,
  }));
};

// Focus indicator symbol
const FOCUS = "›";

// Create a simple item renderer with generic type support
function createItemRenderer<T extends { name: string }>() {
  return ({
    item,
    isFocused,
    isSelected,
  }: {
    item: T;
    isFocused: boolean;
    isSelected: boolean;
    index: number;
  }) => (
    <Text>
      {isFocused ? `${FOCUS} ` : "  "}
      <Text bold={isSelected}>{item.name}</Text>
    </Text>
  );
}

describe("Rendering", () => {
  test("renders all provided items", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    const app = createTestHelper(
      <FocusList items={items} renderItem={renderItem} />
    );

    // Wait for the component to render
    await app.ui.viewRendered("FocusList");

    // Verify all items are rendered
    app.ui.contains("Item 1");
    app.ui.contains("Item 2");
    app.ui.contains("Item 3");
  });

  test("renders title when provided", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    const app = createTestHelper(
      <FocusList items={items} renderItem={renderItem} title="Test List" />
    );

    // Wait for the component to render
    await app.ui.viewRendered("FocusList");

    // Verify title is rendered
    app.ui.contains("Test List");
  });

  test("renders empty message when no items exist", async () => {
    const renderItem = createItemRenderer<TestItem>();

    const { ui, user } = createTestHelper(
      <FocusList
        items={[]}
        renderItem={renderItem}
        emptyMessage="Custom empty message"
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Verify the empty state message
    ui.contains("Custom empty message");
  });

  test("renders custom empty component when provided", async () => {
    const renderItem = createItemRenderer<TestItem>();
    const renderEmpty = () => <Text>Custom empty component</Text>;

    const { ui } = createTestHelper(
      <FocusList items={[]} renderItem={renderItem} renderEmpty={renderEmpty} />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Verify the custom empty component is rendered
    ui.contains("Custom empty component");
  });

  test("handles custom container rendering", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();
    const renderContainer = ({ children }: { children: React.ReactNode }) => (
      <Box borderStyle="round" borderColor="green">
        <Text>Custom container</Text>
        {children}
      </Box>
    );

    const { ui } = createTestHelper(
      <FocusList
        items={items}
        renderItem={renderItem}
        renderContainer={renderContainer}
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Verify the custom container and items are rendered
    ui.contains("Custom container");
    ui.contains("Item 1");
    ui.contains("Item 2");
    ui.contains("Item 3");
  });

  test("handles custom header rendering", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();
    const renderHeader = () => <Text color="green">Custom Header</Text>;

    const { ui } = createTestHelper(
      <FocusList
        items={items}
        renderItem={renderItem}
        renderHeader={renderHeader}
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Verify the custom header and items are rendered
    ui.contains("Custom Header");
    ui.contains("Item 1");
  });
});

describe("Focus Management", () => {
  test("applies focus to initialFocusIndex", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    const app = createTestHelper(
      <FocusList items={items} renderItem={renderItem} initialFocusIndex={1} />
    );

    // Wait for the component to render
    await app.ui.viewRendered("FocusList");

    // Verify initial focus is on the second item
    app.ui.contains("  Item 1"); // No focus
    app.ui.contains(`${FOCUS} Item 2`); // Focused
    app.ui.contains("  Item 3"); // No focus
  });

  test("allows navigation between items", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    const { ui, user } = createTestHelper(
      <FocusList items={items} renderItem={renderItem} />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Initially, the first item should be focused
    ui.contains(`${FOCUS} Item 1`);

    // Navigate through items with chained assertions
    await user.does(user.press("down")).sees("Item 1 no longer focused", () => {
      ui.contains(`${FOCUS} Item 2`);
      ui.doesNotContain(`${FOCUS} Item 1`);
    });

    await user.does(user.press("down")).sees("Item 2 no longer focused", () => {
      ui.contains(`${FOCUS} Item 3`);
      ui.doesNotContain(`${FOCUS} Item 2`);
    });
  });

  test("wraps focus from last to first item", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    const { ui, user } = createTestHelper(
      <FocusList
        items={items}
        renderItem={renderItem}
        initialFocusIndex={2} // Start at the last item
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Verify initial focus is on the last item
    ui.contains(`${FOCUS} Item 3`);

    // Press down to wrap to the first item
    await user.does(user.press("down")).sees("Item 3 no longer focused", () => {
      ui.contains(`${FOCUS} Item 1`); // Wrapped to first item
      ui.doesNotContain(`${FOCUS} Item 3`); // Last item no longer focused
    });

    // Press up to wrap to the last item
    await user.does(user.press("up")).sees("Item 1 no longer focused", () => {
      ui.contains(`${FOCUS} Item 3`); // Wrapped to last item
      ui.doesNotContain(`${FOCUS} Item 1`); // First item no longer focused
    });
  });

  test("maintains focus in bounds when items change", async () => {
    // Create an initial list of 3 items
    const items = createTestItems(3);

    // Create a component with controllable props, providing initial props
    const [component, propController] = createPropsController(
      (props) => (
        <FocusList
          renderItem={createItemRenderer<TestItem>()}
          initialFocusIndex={2} // Start focused on the third item
          {...props}
        />
      ),
      { items } // Initial props with all 3 items
    );

    const { ui, lastFrame } = createTestHelper(component);

    // Wait for the component to initially render with focus on the third item
    await ui.viewRendered("FocusList");

    ui.contains(`${FOCUS} Item 3`);

    // Update to just one item
    propController.setProps({ items: [items[0]] });

    // Wait for the items to change (third item removed)
    const itemsChanged = await waitForCondition(() => {
      const frame = lastFrame();
      return !frame.includes("Item 3");
    });

    expect(itemsChanged, "Items did not change").toBe(true);

    ui.createSnapshot();
    ui.contains(`${FOCUS} Item 1`);
  });

  test("focuses item matching selectedId when it changes", async () => {
    const items = createTestItems(3);

    // Create a component with controllable props, providing initial props
    const [component, propController] = createPropsController(
      (props) => (
        <FocusList renderItem={createItemRenderer<TestItem>()} {...props} />
      ),
      { items, selectedId: null } // Initial props
    );

    const { ui, lastFrame } = createTestHelper(component);

    await ui.viewRendered("FocusList");

    // Verify initial focus on first item
    ui.contains(`${FOCUS} Item 1`);

    // Update selectedId to focus the second item
    propController.setProps({ selectedId: "item-2" });

    // Wait for the selection to change to the second item
    const focusChanged = await waitForCondition(() =>
      lastFrame().includes(`${FOCUS} Item 2`)
    );

    expect(focusChanged, "Focus did not move to Item 2").toBe(true);

    // Verify focus moved to the second item
    ui.createSnapshot();
    ui.contains(`${FOCUS} Item 2`);
    ui.contains("  Item 1"); // First item no longer focused
  });
});

describe("Selection", () => {
  test("applies selection styling to selectedId", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    const app = createTestHelper(
      <FocusList items={items} renderItem={renderItem} selectedId="item-2" />
    );

    // Wait for the component to render
    await app.ui.viewRendered("FocusList");

    // Get actual frame, with ANSI codes
    const rawFrame = app.rawFrame();

    // ANSI bold text
    const BOLD = (text: string) => `\u001b[1m${text}\u001b[22m`;

    // Verify Item 2 is both focused and bold (selected)
    expect(rawFrame).toContain(`${FOCUS} ${BOLD("Item 2")}`);

    // Verify other items are not bold
    expect(rawFrame).not.toContain(BOLD("Item 1"));
    expect(rawFrame).not.toContain(BOLD("Item 3"));
  });

  test("handles custom getItemId function", async () => {
    // Create items with custom ID structure
    const customItems: CustomIdItem[] = [
      { customId: "a1", name: "Item 1" },
      { customId: "b2", name: "Item 2" },
      { customId: "c3", name: "Item 3" },
    ];

    const renderItem = createItemRenderer<CustomIdItem>();
    const getItemId = (item: CustomIdItem) => item.customId;

    const { ui } = createTestHelper(
      <FocusList
        items={customItems}
        renderItem={renderItem}
        getItemId={getItemId}
        selectedId="b2" // This should match Item 2
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Verify Item 2 is focused because it matches the selectedId
    ui.contains(`${FOCUS} Item 2`);
  });

  test("allows navigation after selection", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    // Create component with controllable selectedId prop
    const [component, propController] = createPropsController((props) => (
      <FocusList<TestItem>
        items={items}
        renderItem={renderItem}
        onSelect={(item) => {
          // When an item is selected, update the selectedId prop
          propController.setProps({ selectedId: item?.id ?? null });
        }}
        {...props}
      />
    ));

    const { ui, user } = createTestHelper(component);

    // Wait for initial render with focus on first item
    await ui.viewRendered("FocusList");
    ui.contains(`${FOCUS} Item 1`);

    // 1. First select the focused item
    await user.press("return");

    // 2. Navigation should still work - move down to second item
    await user.press("down");

    // 3. Verify focus has moved
    ui.contains(`${FOCUS} Item 2`);
    ui.doesNotContain(`${FOCUS} Item 1`);
  });
});

describe("Event/Callback", () => {
  test("calls onSelect when select key is pressed", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();

    // Create a more type-safe mock
    let selectedItem: TestItem | null = null;
    const onSelect = (item: TestItem | null) => {
      selectedItem = item;
    };
    const mockOnSelect = mock(onSelect);

    const { ui, user } = createTestHelper(
      <FocusList
        items={items}
        renderItem={renderItem}
        onSelect={mockOnSelect}
        initialFocusIndex={1} // Start on the second item
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Press enter to select the focused item
    await user.press("return");

    // Verify onSelect was called
    expect(mockOnSelect).toHaveBeenCalled();
  });

  test("calls onFocusChange when focus changes", async () => {
    const items = createTestItems(3);
    const renderItem = createItemRenderer<TestItem>();
    const onFocusChange = mock(() => {});

    const { ui, user } = createTestHelper(
      <FocusList
        items={items}
        renderItem={renderItem}
        onFocusChange={onFocusChange}
      />
    );

    // Wait for the component to render
    await ui.viewRendered("FocusList");

    // Press down to move focus and verify callback is called
    await user.press("down");

    expect(onFocusChange).toHaveBeenCalled();
    expect(onFocusChange.mock.calls).toContainEqual([1]); // Called with second index
  });
});
