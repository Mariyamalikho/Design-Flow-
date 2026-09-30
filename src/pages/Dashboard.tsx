import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FolderKanban, CheckCircle2, Clock, Activity, MessageSquare, Edit3, Image as ImageIcon } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

const recentActivities = [
  { id: 1, type: "create", user: "You", target: "Acme Rebrand", time: "2 hours ago", icon: Edit3, color: "text-blue-500" },
  { id: 2, type: "update", user: "You", target: "Logo Concepts", time: "4 hours ago", icon: ImageIcon, color: "text-purple-500" },
  { id: 3, type: "comment", user: "Client", target: "Brand Guidelines", time: "1 day ago", icon: MessageSquare, color: "text-green-500" },
  { id: 4, type: "complete", user: "You", target: "Typography Selection", time: "2 days ago", icon: CheckCircle2, color: "text-indigo-500" },
];

export default function Dashboard() {
  const projectCount = useLiveQuery(() => db.projects.count()) || 0;
  const taskCount = useLiveQuery(() => db.tasks.count()) || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full">
      <div>
        <h1 className="text-3xl font-serif text-zinc-900 dark:text-zinc-50 font-semibold mb-2">Good morning</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Here is what is happening in your creative workspace today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projectCount}</div>
            <p className="text-xs text-zinc-500 mt-1">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taskCount}</div>
            <p className="text-xs text-zinc-500 mt-1">4 due today</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">84%</div>
            <p className="text-xs text-zinc-500 mt-1">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* We will put the Project list or charts here later */}
          <div className="h-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-center border-dashed">
            <p className="text-zinc-400 text-sm">Productivity Chart Placeholder</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="relative flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm z-10 ${activity.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-zinc-900 dark:text-zinc-100">
                          <span className="font-medium">{activity.user}</span> {activity.type}d <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
