/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'quickstart',
        'installation',
        'authentication',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/endpoints',
        'api/authentication',
        'api/rate-limiting',
        'api/errors',
      ],
    },
    {
      type: 'category',
      label: 'Webhooks',
      items: [
        'webhooks/overview',
        'webhooks/events',
        'webhooks/security',
        'webhooks/testing',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      items: [
        'sdks/typescript',
        'sdks/python',
        'sdks/examples',
      ],
    },
    {
      type: 'category',
      label: 'Compliance',
      items: [
        'compliance/overview',
        'compliance/matrix',
        'compliance/countries',
        'compliance/formats',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'ops/backup-dr',
        'ops/monitoring',
        'ops/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/error-codes',
        'reference/glossary',
        'reference/changelog',
      ],
    },
  ],
};

module.exports = sidebars;
