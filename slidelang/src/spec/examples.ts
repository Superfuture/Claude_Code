export const Q3_BOARD_UPDATE_YAML = `meta:
  title: Q3 Board Update — Acme Inc.
  theme: light
  size: { w: 1280, h: 720 }

slides:
  - id: title
    blocks:
      - type: text
        x: 8
        y: 38
        w: 84
        h: 18
        content: "Q3 Board Update"
        style: title
      - type: text
        x: 8
        y: 60
        w: 84
        h: 8
        content: "Acme Inc. — October 2026"
        style: subtitle

  - id: metrics
    blocks:
      - type: text
        x: 6
        y: 6
        w: 88
        h: 10
        content: "Quarterly Metrics"
        style: h1
      - type: chart
        x: 6
        y: 22
        w: 56
        h: 68
        spec:
          $schema: https://vega.github.io/schema/vega-lite/v5.json
          background: transparent
          data:
            values:
              - { quarter: Q1, arr: 1.2 }
              - { quarter: Q2, arr: 1.6 }
              - { quarter: Q3, arr: 2.4 }
              - { quarter: Q4, arr: 3.3 }
          mark: { type: bar, cornerRadiusEnd: 4, color: "#c96442" }
          encoding:
            x: { field: quarter, type: nominal, axis: { labelFontSize: 13, title: null } }
            y: { field: arr, type: quantitative, axis: { title: "ARR ($M)", titleFontSize: 12, labelFontSize: 11 } }
      - type: text
        x: 66
        y: 22
        w: 28
        h: 14
        content: "ARR up 38% QoQ"
        style: h2
      - type: text
        x: 66
        y: 38
        w: 28
        h: 50
        content: "• 142 net-new customers\\n• Gross margin steady at 78%\\n• Logo retention 96%\\n• Magic number 1.4"
        style: bullets

  - id: math
    blocks:
      - type: text
        x: 6
        y: 6
        w: 88
        h: 10
        content: "Unit Economics"
        style: h1
      - type: math
        x: 14
        y: 28
        w: 72
        h: 22
        latex: "\\\\text{LTV} = \\\\frac{\\\\text{ARPU} \\\\cdot \\\\text{Gross Margin}}{\\\\text{Monthly Churn}}"
        display: true
      - type: text
        x: 14
        y: 58
        w: 72
        h: 30
        content: "LTV:CAC = 4.2× — back above target of 3×. Payback period 11 months."
        style: body

  - id: roadmap
    blocks:
      - type: text
        x: 6
        y: 6
        w: 88
        h: 10
        content: "Roadmap — Next 90 Days"
        style: h1
      - type: image
        x: 0
        y: 0
        w: 100
        h: 100
        source:
          provider: unsplash
          query: "abstract gradient pastel"
      - type: text
        x: 8
        y: 24
        w: 84
        h: 64
        content: "• Ship Inbox 2.0 to GA\\n• Launch enterprise SSO\\n• Hire 4 GTM, 6 engineering\\n• Close Series A by Dec 15"
        style: bullets
        color: "#1f1e1d"

  - id: ask
    blocks:
      - type: text
        x: 8
        y: 30
        w: 84
        h: 14
        content: "The Ask"
        style: title
      - type: text
        x: 8
        y: 52
        w: 84
        h: 12
        content: "Two intros to enterprise customers + one design lead candidate."
        style: subtitle
`;

export const EMPTY_DECK_YAML = `meta:
  title: New Deck
  theme: light

slides:
  - id: cover
    blocks:
      - type: text
        x: 10
        y: 40
        w: 80
        h: 20
        content: "Your title here"
        style: title
`;
