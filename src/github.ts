import dotenv from 'dotenv';
dotenv.config();

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0: no activity, 1-4: increasing activity
}

export type ActivityGrid = ContributionDay[][]; // 53 weeks of 7 days

const GRAPHQL_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// Map GitHub GraphQL contribution levels to numbers 0-4
function mapLevel(levelString: string): number {
  switch (levelString) {
    case 'FIRST_QUARTILE': return 1;
    case 'SECOND_QUARTILE': return 2;
    case 'THIRD_QUARTILE': return 3;
    case 'FOURTH_QUARTILE': return 4;
    case 'NONE':
    default:
      return 0;
  }
}

/**
 * Fetches the GitHub activity calendar for a user using GraphQL.
 * Falls back to mock data if no token is provided or if the fetch fails.
 */
export async function fetchGitHubActivity(username: string, token?: string): Promise<ActivityGrid> {
  const authToken = token || process.env.GITHUB_TOKEN;

  if (!authToken) {
    console.warn('⚠️ No GITHUB_TOKEN found. Generating mock activity data for demonstration...');
    return generateMockActivity();
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'github-activity-visualizer',
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as any;

    if (result.errors) {
      throw new Error(`GraphQL Errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      throw new Error(`Could not find contribution calendar for user "${username}"`);
    }

    const grid: ActivityGrid = [];
    
    for (const week of calendar.weeks) {
      const weekDays: ContributionDay[] = [];
      for (const day of week.contributionDays) {
        weekDays.push({
          date: day.date,
          count: day.contributionCount,
          level: mapLevel(day.contributionLevel),
        });
      }
      // Fill incomplete weeks (e.g. at start or end of year) to exactly 7 days if needed
      // but usually GitHub GraphQL returns the active days. Let's make sure we have up to 7 items.
      grid.push(weekDays);
    }

    return grid;
  } catch (error: any) {
    console.error(`❌ Failed to fetch GitHub activity: ${error.message}`);
    console.warn('⚠️ Falling back to mock activity data...');
    return generateMockActivity();
  }
}

/**
 * Generates mock activity data resembling a typical GitHub contribution graph.
 * Includes weekend lulls, some high-activity streaks, and seasonal changes.
 */
export function generateMockActivity(): ActivityGrid {
  const grid: ActivityGrid = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(today.getDate() - 364); // 52 weeks

  // Start from the Sunday of the week containing oneYearAgo
  const startDay = new Date(oneYearAgo);
  const dayOfWeek = startDay.getDay(); // 0: Sunday, 1: Monday...
  startDay.setDate(startDay.getDate() - dayOfWeek);

  let current = new Date(startDay);

  for (let w = 0; w < 53; w++) {
    const weekDays: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Determine pseudo-random contribution level
      // High frequency patterns, weekly patterns (weekends are usually lower)
      const day = current.getDay();
      const isWeekend = day === 0 || day === 6;
      
      // Use trigonometric functions + random noise to create realistic-looking commit spikes/dry spells
      const timeVal = current.getTime() / (1000 * 60 * 60 * 24);
      const wave = Math.sin(timeVal / 20) * 0.4 + Math.sin(timeVal / 5) * 0.3;
      const noise = Math.random() * 0.5;
      const activityIndex = wave + noise + (isWeekend ? -0.3 : 0.3);

      let level = 0;
      if (activityIndex > 0.6) level = 4;
      else if (activityIndex > 0.3) level = 3;
      else if (activityIndex > 0.0) level = 2;
      else if (activityIndex > -0.3) level = 1;
      
      // Make some holiday dry periods
      const month = current.getMonth();
      if ((month === 11 && current.getDate() > 20) || (month === 7 && current.getDate() < 15)) {
        // Summer holidays and Christmas
        if (Math.random() > 0.15) level = 0;
      }

      // Calculate pseudo counts based on level
      let count = 0;
      if (level === 1) count = Math.floor(Math.random() * 2) + 1;
      else if (level === 2) count = Math.floor(Math.random() * 4) + 3;
      else if (level === 3) count = Math.floor(Math.random() * 6) + 7;
      else if (level === 4) count = Math.floor(Math.random() * 15) + 13;

      weekDays.push({
        date: dateStr,
        count,
        level,
      });

      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    grid.push(weekDays);
  }

  return grid;
}
