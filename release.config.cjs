// release.config.js
module.exports = {
  branches: [
    'main',
    {
      name: 'beta',
      prerelease: true,
    },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release-plus/docker',
      {
        name: '490004636127.dkr.ecr.eu-west-2.amazonaws.com/ctx-cortex-systems-prod-m365-mcp:latest',
        skipLogin: true,
      },
    ],
    '@semantic-release/github',
  ],
}
