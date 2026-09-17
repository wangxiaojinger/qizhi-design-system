import { expect, test } from "@playwright/test";

test("Business object display exposes seven fixed business cards", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#business-object-display");
  const section = page.locator("#business-object-display");
  await expect(section.getByRole("heading", { name: "对象展示" }))
    .toBeVisible();
  await expect(section.locator(".codebox-wrapper")).toHaveCount(7);
  await expect(section.locator("#business-object-display-API table"))
    .toHaveCount(7);
  await expect(section.locator(".qizhi-task-item")).toHaveCount(1);

  const longDescription = section.locator(
    ".qizhi-model-card--marketplace .qizhi-model-card__description",
  ).first();
  await longDescription.focus();
  await expect(page.getByRole("tooltip")).toContainText("DeepSeek-V3");

  const marketplaceCards = section.locator(
    ".qizhi-model-card--marketplace",
  );
  await expect(marketplaceCards).toHaveCount(2);
  if (testInfo.project.name === "desktop-1440") {
    await expect(marketplaceCards.first()).toHaveCSS("width", "320px");
  }
  for (const card of await marketplaceCards.all()) {
    const actions = card.locator(".qizhi-model-card__actions--three");
    const buttons = card.getByRole("button");
    await expect(buttons).toHaveText([
      "查看详情",
      "快速体验",
      "在线推理",
    ]);
    const actionColumns = await actions.evaluate((node) => (
      getComputedStyle(node).gridTemplateColumns.split(" ")
    ));
    expect(actionColumns).toHaveLength(3);
    const actionTops = await buttons.evaluateAll((items) => (
      items.map((item) => item.getBoundingClientRect().top)
    ));
    expect(new Set(actionTops).size).toBe(1);
    await expect(card.getByRole("button", { name: "快速体验" })
      .locator("svg")).toHaveCount(1);
    await expect(card.getByRole("button", { name: "在线推理" })
      .locator("svg")).toHaveCount(1);
    await expect(card.getByRole("button", { name: "在线推理" }))
      .toHaveCSS("white-space", "nowrap");
  }
  const quickAction = marketplaceCards.first().getByRole("button", {
    name: "快速体验",
  });
  const dividers = await quickAction.evaluate((button) => {
    const read = (pseudo: "::before" | "::after") => {
      const style = getComputedStyle(button, pseudo);
      return {
        backgroundColor: style.backgroundColor,
        height: style.height,
        top: style.top,
        transform: style.transform,
      };
    };
    return { before: read("::before"), after: read("::after") };
  });
  expect(dividers).toEqual({
    before: {
      backgroundColor: "rgb(229, 230, 235)",
      height: "14px",
      top: "20px",
      transform: "matrix(1, 0, 0, 1, 0, -7)",
    },
    after: {
      backgroundColor: "rgb(229, 230, 235)",
      height: "14px",
      top: "20px",
      transform: "matrix(1, 0, 0, 1, 0, -7)",
    },
  });

  const financial = section.locator(".qizhi-model-card--financial");
  await financial.focus();
  await expect(financial.getByRole("button", { name: "去使用" }))
    .toBeVisible();

  const skillServiceSummary = section.locator(
    ".qizhi-skill-service-card__summary",
  );
  const skillServiceIcon = section.locator(
    ".qizhi-skill-service-card__icon",
  );
  await expect(skillServiceIcon).toHaveCSS("width", "46px");
  await expect(skillServiceIcon).toHaveCSS("height", "46px");
  await expect(skillServiceIcon).toHaveCSS("border-radius", "8px");
  await expect(skillServiceIcon).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(skillServiceIcon.locator("svg")).toHaveCSS("width", "41px");
  await expect(skillServiceIcon.locator("svg")).toHaveCSS("height", "39px");
  await skillServiceSummary.focus();
  const skillServicePopup = page.getByRole("tooltip", {
    name: /Yahoo Finance/,
  });
  await expect(skillServicePopup).toBeVisible();
  const popupEvidence = await skillServicePopup.evaluate((popup) => {
    const popupRect = popup.getBoundingClientRect();
    const clippingAncestors = [];
    let parent = popup.parentElement;
    while (parent && parent !== document.body) {
      const style = getComputedStyle(parent);
      const rect = parent.getBoundingClientRect();
      const clips = [style.overflow, style.overflowX, style.overflowY]
        .some((value) => ["hidden", "clip", "scroll", "auto"]
          .includes(value));
      if (clips && (
        popupRect.top < rect.top
        || popupRect.right > rect.right
        || popupRect.bottom > rect.bottom
        || popupRect.left < rect.left
      )) clippingAncestors.push(parent.className);
      parent = parent.parentElement;
    }
    return {
      clippingAncestors,
      withinViewport: popupRect.left >= 0
        && popupRect.right <= window.innerWidth
        && popupRect.top >= 0
        && popupRect.bottom <= window.innerHeight,
    };
  });
  expect(popupEvidence).toEqual({
    clippingAncestors: [],
    withinViewport: true,
  });
  await section.locator('[id="对象展示-Skill服务卡"]')
    .screenshot({
      path: testInfo.outputPath(
        "skill-service-card-open-" + testInfo.project.name + ".png",
      ),
    });

  const projectDemo = section.locator(".business-project-demo");
  await expect(projectDemo.locator(".qizhi-project-card")).toHaveCount(3);
  await projectDemo.getByText("空间类型", { exact: true }).click();
  await expect(projectDemo.locator(".qizhi-project-card")).toHaveCount(2);
  await projectDemo.getByText("资源申请与变更", {
    exact: true,
  }).click();
  await expect(projectDemo.locator(".qizhi-project-card")).toHaveCount(3);
  await projectDemo.getByText("资源风险", { exact: true }).click();
  await expect(projectDemo.getByText(/可用预算不足 15%/)).toBeVisible();
  const budgetRisk = projectDemo.getByText(/可用预算不足 15%/)
    .locator(
      "xpath=ancestor::*[contains(concat(' ', @class, ' '), "
      + "' qizhi-alert ')][1]",
    );
  await expect(budgetRisk).toHaveClass(/qizhi-alert--warning/);
  await expect(budgetRisk).toHaveClass(/qizhi-alert--small/);
  await expect(budgetRisk).toHaveClass(/qizhi-alert--inline/);
  const memberAction = projectDemo.getByRole("button", {
    name: "管理项目成员",
  }).first();
  await expect(memberAction.locator("svg[data-icon-component=TeamIcon]"))
    .toHaveCount(1);
  await expect(memberAction).toHaveCSS("color", "rgb(134, 144, 156)");
  const avatarColors = await projectDemo.locator(".qizhi-project-card")
    .first().locator(".qizhi-avatar").evaluateAll((avatars) => (
      avatars.map((avatar) => getComputedStyle(avatar).backgroundColor)
    ));
  expect(new Set(avatarColors).size).toBe(3);
  await projectDemo.getByRole("link", { name: /进入项目/ }).first().click();
  await expect(projectDemo.getByRole("status")).toContainText("已进入项目");

  const resourceDemo = section.locator(
    '[id="对象展示-资源规格确认"]',
  );
  const resourceConfirmation = resourceDemo.locator(
    ".qizhi-confirmation-summary--resource",
  );
  const billingDemo = section.locator(
    '[id="对象展示-计费规则费用预算卡片"]',
  );
  const confirmationGroup = billingDemo.locator(
    ".qizhi-confirmation-summary-group",
  );
  await expect(resourceConfirmation).toHaveCount(1);
  await expect(confirmationGroup).toHaveCount(1);
  await expect(confirmationGroup.locator(
    ":scope > .qizhi-confirmation-summary",
  )).toHaveCount(2);
  await expect(confirmationGroup).toHaveCSS("display", "flex");
  await expect(confirmationGroup).toHaveCSS("flex-direction", "column");
  await expect(confirmationGroup).toHaveCSS("gap", "24px");
  await expect(confirmationGroup).toHaveCSS("padding", "24px");
  const billingRuleBody = confirmationGroup.locator(
    ":scope > .qizhi-confirmation-summary:first-child "
    + ".qizhi-confirmation-summary__body",
  );
  await expect(billingRuleBody).toHaveCSS(
    "background-color",
    "rgb(247, 248, 250)",
  );
  if (testInfo.project.name !== "mobile-375") {
    await expect(resourceConfirmation).toHaveCSS("width", "558px");
    const resourceBody = resourceConfirmation.locator(
      ".qizhi-confirmation-summary__body",
    );
    await expect(resourceBody).toHaveCSS("display", "flex");
    await expect(resourceBody).toHaveCSS("flex-direction", "column");
    await expect(resourceBody).toHaveCSS("align-items", "flex-start");
    await expect(resourceBody).toHaveCSS("padding", "12px");
    await expect(resourceBody).toHaveCSS("gap", "12px");
    await expect(resourceBody).toHaveCSS("width", "558px");
    await expect(resourceBody).toHaveCSS("height", "152px");
    await expect(resourceBody).toHaveCSS("border-radius", "8px");
    await expect(resourceBody).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0.02)",
    );
    await expect(confirmationGroup).toHaveCSS("width", "360px");
    const confirmationWidths = await confirmationGroup.locator(
      ":scope > .qizhi-confirmation-summary",
    ).evaluateAll((items) => items.map((item) => (
      item.getBoundingClientRect().width
    )));
    expect(confirmationWidths).toEqual([312, 312]);
  }
  await resourceDemo.locator(".business-object-preview").screenshot({
    path: testInfo.outputPath(
      "resource-specification-card-" + testInfo.project.name + ".png",
    ),
  });
  await billingDemo.locator(".business-object-preview").screenshot({
    path: testInfo.outputPath(
      "billing-budget-card-" + testInfo.project.name + ".png",
    ),
  });

  if (testInfo.project.name === "desktop-1440") {
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();
    await expect(toc.locator(".toc-link")).toHaveText([
      "任务卡",
      "模型卡片",
      "金融启智模型卡片",
      "Skill 服务卡",
      "项目卡",
      "资源规格确认",
      "计费规则费用预算卡片",
      "API",
    ]);
  }

  await expect.poll(() => section.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  await section.screenshot({
    path: testInfo.outputPath(
      "business-object-display-" + testInfo.project.name + ".png",
    ),
  });
  expect(errors).toEqual([]);
});
