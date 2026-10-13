# <Feature name> — Tests and verification

## Test plan

| Level | Web | Android | Windows |
|---|---|---|---|
| Unit (helpers, hooks, view models) | Vitest | JUnit + Turbine | MSTest |
| Component (each state) | Storybook + interaction + axe | Compose UI test | UITestMethod |
| Screenshots (he/en × light/dark) | Vitest browser / Playwright | Roborazzi | Screenshot test |
| Journey | Playwright (MSW and local stack) | Instrumented smoke | FlaUI smoke |

## Acceptance criteria coverage

| Acceptance criterion | Tests |
|---|---|

## Edge cases considered

<From the tdd skill's UI checklist.>

## Verification evidence

<One section per slice, in the format of the feature-verification skill.>
