"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Target,
  Sparkles,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Clock,
  Users,
  ListTodo,
  Mountain,
  Compass,
  Flag,
  Award,
  UserCheck,
  Send,
  Loader2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Rock {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: "on-track" | "at-risk" | "off-track" | "complete";
  progress: number;
  quarter: string;
}

interface ScorecardMetric {
  id: string;
  name: string;
  goal: number;
  actual: number;
  owner: string;
  trend: "up" | "down" | "flat";
  unit?: string;
}

interface Issue {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  identifiedDate: string;
  owner: string;
  status: "open" | "in-progress" | "solved";
}

interface Todo {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "complete";
  createdDate: string;
}

interface Meeting {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  rating: number;
  issuesSolved: number;
  rocksReviewed: boolean;
  scorecardReviewed: boolean;
  todoCompletionRate: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  getsIt: boolean | null;
  wantsIt: boolean | null;
  capacityToDoIt: boolean | null;
  rightSeat: boolean | null;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  actions?: { label: string; value: string }[];
}

// Mock data
const initialRocks: Rock[] = [
  { id: "rock-1", description: "Implement new CRM system and migrate all customer data", owner: "John Smith", dueDate: "2025-03-31", status: "on-track", progress: 65, quarter: "Q1 2025" },
  { id: "rock-2", description: "Launch affiliate partner program with 10 certified partners", owner: "Sarah Johnson", dueDate: "2025-03-31", status: "at-risk", progress: 40, quarter: "Q1 2025" },
  { id: "rock-3", description: "Achieve ISO 9001 certification for consulting services", owner: "Mike Chen", dueDate: "2025-03-31", status: "on-track", progress: 80, quarter: "Q1 2025" },
  { id: "rock-4", description: "Develop and launch EDGE™ Platform MVP", owner: "Emily Davis", dueDate: "2025-03-31", status: "off-track", progress: 25, quarter: "Q1 2025" },
  { id: "rock-5", description: "Hire 3 senior consultants for manufacturing practice", owner: "John Smith", dueDate: "2025-03-31", status: "complete", progress: 100, quarter: "Q1 2025" },
];

const initialMetrics: ScorecardMetric[] = [
  { id: "metric-1", name: "Weekly Revenue", goal: 50000, actual: 52000, owner: "John Smith", trend: "up", unit: "$" },
  { id: "metric-2", name: "New Leads", goal: 25, actual: 18, owner: "Sarah Johnson", trend: "down" },
  { id: "metric-3", name: "Conversion Rate", goal: 30, actual: 32, owner: "Sarah Johnson", trend: "up", unit: "%" },
  { id: "metric-4", name: "Customer Satisfaction", goal: 90, actual: 88, owner: "Mike Chen", trend: "flat", unit: "%" },
  { id: "metric-5", name: "On-Time Delivery", goal: 95, actual: 97, owner: "Emily Davis", trend: "up", unit: "%" },
  { id: "metric-6", name: "Cash Balance", goal: 100000, actual: 125000, owner: "John Smith", trend: "up", unit: "$" },
];

const initialIssues: Issue[] = [
  { id: "issue-1", description: "CRM vendor delayed implementation timeline by 2 weeks", priority: "high", identifiedDate: "2025-01-15", owner: "John Smith", status: "in-progress" },
  { id: "issue-2", description: "Need additional budget for EDGE™ Platform development", priority: "high", identifiedDate: "2025-01-20", owner: "Emily Davis", status: "open" },
  { id: "issue-3", description: "Partner onboarding process taking too long", priority: "medium", identifiedDate: "2025-01-10", owner: "Sarah Johnson", status: "in-progress" },
];

const initialTodos: Todo[] = [
  { id: "todo-1", description: "Schedule meeting with CRM vendor to discuss timeline", owner: "John Smith", dueDate: "2025-01-22", status: "complete", createdDate: "2025-01-15" },
  { id: "todo-2", description: "Prepare budget proposal for EDGE™ Platform", owner: "Emily Davis", dueDate: "2025-01-25", status: "in-progress", createdDate: "2025-01-20" },
  { id: "todo-3", description: "Review and approve partner agreement template", owner: "Sarah Johnson", dueDate: "2025-01-24", status: "not-started", createdDate: "2025-01-18" },
];

const initialTeam: TeamMember[] = [
  { id: "tm-1", name: "John Smith", role: "CEO / Integrator", getsIt: true, wantsIt: true, capacityToDoIt: true, rightSeat: true },
  { id: "tm-2", name: "Sarah Johnson", role: "VP Sales", getsIt: true, wantsIt: true, capacityToDoIt: true, rightSeat: true },
  { id: "tm-3", name: "Mike Chen", role: "VP Operations", getsIt: true, wantsIt: true, capacityToDoIt: null, rightSeat: null },
  { id: "tm-4", name: "Emily Davis", role: "VP Technology", getsIt: true, wantsIt: null, capacityToDoIt: true, rightSeat: null },
];

const initialMeetings: Meeting[] = [
  { id: "meeting-1", date: "2025-01-20", startTime: "09:00", endTime: "10:30", attendees: ["John Smith", "Sarah Johnson", "Mike Chen", "Emily Davis"], rating: 8, issuesSolved: 3, rocksReviewed: true, scorecardReviewed: true, todoCompletionRate: 85 },
  { id: "meeting-2", date: "2025-01-13", startTime: "09:00", endTime: "10:30", attendees: ["John Smith", "Sarah Johnson", "Mike Chen", "Emily Davis"], rating: 9, issuesSolved: 4, rocksReviewed: true, scorecardReviewed: true, todoCompletionRate: 90 },
];

export default function TractionDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rocks] = useState<Rock[]>(initialRocks);
  const [metrics] = useState<ScorecardMetric[]>(initialMetrics);
  const [issues] = useState<Issue[]>(initialIssues);
  const [todos] = useState<Todo[]>(initialTodos);
  const [team] = useState<TeamMember[]>(initialTeam);
  const [meetings] = useState<Meeting[]>(initialMeetings);
  const [currentQuarter] = useState("Q1 2025");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playbookPhase, setPlaybookPhase] = useState<string>("intro");
  const [showPlaybookChat, setShowPlaybookChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const calculateOverallHealth = () => {
    const rockScore = rocks.filter(r => r.status === "on-track" || r.status === "complete").length / rocks.length * 10;
    const metricScore = metrics.filter(m => m.actual >= m.goal).length / metrics.length * 10;
    return Math.round((rockScore + metricScore) / 2 * 10) / 10;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": case "complete": return "text-green-600 bg-green-100";
      case "at-risk": return "text-yellow-600 bg-yellow-100";
      case "off-track": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on-track": case "complete": return <CheckCircle className="h-4 w-4" />;
      case "at-risk": return <AlertCircle className="h-4 w-4" />;
      case "off-track": return <XCircle className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const startPlaybookChat = () => {
    setShowPlaybookChat(true);
    setChatMessages([{
      id: "msg-1",
      role: "assistant",
      content: `👋 Hi! I'm your Traction Assistant. I'll help you create a customized Mattermost Playbook to execute your quarterly rocks and track your EOS metrics.\n\nThis will take about 5-10 minutes. Ready to get started?\n\n**What quarter are we planning for?**`,
      timestamp: new Date(),
      actions: [
        { label: "Q1 2025", value: "Q1 2025" },
        { label: "Q2 2025", value: "Q2 2025" },
      ],
    }]);
    setPlaybookPhase("intro");
  };

  const sendChatMessage = async (message: string) => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: "user", content: message, timestamp: new Date() }]);
    setChatInput("");
    setIsAiThinking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponse: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    if (playbookPhase === "intro") {
      aiResponse.content = `Great! Planning for **${message}**.\n\nI see you have **${rocks.length} rocks** defined. Would you like to use these existing rocks for the playbook?`;
      aiResponse.actions = [{ label: "Use existing rocks", value: "use_existing" }, { label: "Start fresh", value: "fresh" }];
      setPlaybookPhase("rocks");
    } else if (playbookPhase === "rocks") {
      aiResponse.content = `Perfect! Using your ${rocks.length} rocks.\n\n📊 You have **${metrics.length} scorecard metrics**. Include all in the playbook?`;
      aiResponse.actions = [{ label: "Include all metrics", value: "all_metrics" }];
      setPlaybookPhase("scorecard");
    } else if (playbookPhase === "scorecard") {
      aiResponse.content = `Excellent! Including all metrics.\n\n📅 **When do you hold Level 10 meetings?**`;
      aiResponse.actions = [{ label: "Monday 9:00 AM", value: "Monday 9:00 AM" }, { label: "Tuesday 9:00 AM", value: "Tuesday 9:00 AM" }];
      setPlaybookPhase("meetings");
    } else if (playbookPhase === "meetings") {
      aiResponse.content = `✅ **Playbook Ready!**\n\n- Quarter: ${currentQuarter}\n- Rocks: ${rocks.length}\n- Metrics: ${metrics.length}\n- Level 10: ${message}\n\n**Generate your Mattermost Playbook?**`;
      aiResponse.actions = [{ label: "✅ Generate Playbook", value: "generate" }];
      setPlaybookPhase("review");
    } else if (playbookPhase === "review") {
      aiResponse.content = `🎉 **Playbook Generated!**\n\nYour "Traction ${currentQuarter} Execution" playbook is ready with:\n- ${rocks.length * 13} Rock update tasks\n- ${metrics.length * 13} Scorecard reviews\n- 13 Level 10 meeting checklists`;
      aiResponse.actions = [{ label: "📋 Copy JSON", value: "copy" }, { label: "⬇️ Download", value: "download" }];
      setPlaybookPhase("complete");
    }

    setChatMessages(prev => [...prev, aiResponse]);
    setIsAiThinking(false);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const overallHealth = calculateOverallHealth();

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  Traction Dashboard
                  <Badge variant="secondary" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />EOS</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">Strategic Value Plus • {currentQuarter}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Overall Health</p>
                <p className={cn("text-2xl font-bold", overallHealth >= 8 ? "text-green-600" : overallHealth >= 6 ? "text-yellow-600" : "text-red-600")}>{overallHealth}/10</p>
              </div>
              <Button onClick={startPlaybookChat} className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />Generate Playbook
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="border-b px-4">
            <TabsList className="h-10">
              <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
              <TabsTrigger value="vto" className="gap-2"><Compass className="h-4 w-4" />V/TO</TabsTrigger>
              <TabsTrigger value="rocks" className="gap-2"><Mountain className="h-4 w-4" />Rocks ({rocks.length})</TabsTrigger>
              <TabsTrigger value="scorecard" className="gap-2"><BarChart3 className="h-4 w-4" />Scorecard</TabsTrigger>
              <TabsTrigger value="issues" className="gap-2"><Flag className="h-4 w-4" />Issues ({issues.filter(i => i.status !== "solved").length})</TabsTrigger>
              <TabsTrigger value="meetings" className="gap-2"><Calendar className="h-4 w-4" />Meetings</TabsTrigger>
              <TabsTrigger value="todos" className="gap-2"><ListTodo className="h-4 w-4" />To-Dos ({todos.filter(t => t.status !== "complete").length})</TabsTrigger>
              <TabsTrigger value="people" className="gap-2"><Users className="h-4 w-4" />People</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Rocks On Track</p><p className="text-2xl font-bold">{rocks.filter(r => r.status === "on-track" || r.status === "complete").length}/{rocks.length}</p></div><Mountain className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Scorecard At Goal</p><p className="text-2xl font-bold">{metrics.filter(m => m.actual >= m.goal).length}/{metrics.length}</p></div><BarChart3 className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Open Issues</p><p className="text-2xl font-bold">{issues.filter(i => i.status !== "solved").length}</p></div><Flag className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
                  <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avg Meeting Rating</p><p className="text-2xl font-bold">{(meetings.reduce((sum, m) => sum + m.rating, 0) / meetings.length).toFixed(1)}</p></div><Award className="h-8 w-8 text-green-600" /></div></CardContent></Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Mountain className="h-5 w-5" />Quarterly Rocks - {currentQuarter}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rocks.map(rock => (
                        <div key={rock.id} className="flex items-center gap-4">
                          <Badge className={cn("w-24 justify-center", getStatusColor(rock.status))}>{getStatusIcon(rock.status)}<span className="ml-1 capitalize">{rock.status.replace("-", " ")}</span></Badge>
                          <div className="flex-1"><p className="font-medium">{rock.description}</p><p className="text-sm text-muted-foreground">{rock.owner}</p></div>
                          <div className="w-32"><Progress value={rock.progress} className="h-2" /><p className="text-xs text-muted-foreground text-right mt-1">{rock.progress}%</p></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Weekly Scorecard</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead>Owner</TableHead><TableHead className="text-right">Goal</TableHead><TableHead className="text-right">Actual</TableHead><TableHead className="text-center">Trend</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {metrics.map(metric => (
                          <TableRow key={metric.id}>
                            <TableCell className="font-medium">{metric.name}</TableCell>
                            <TableCell>{metric.owner}</TableCell>
                            <TableCell className="text-right">{metric.unit}{metric.goal.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{metric.unit}{metric.actual.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{getTrendIcon(metric.trend)}</TableCell>
                            <TableCell className="text-center">{metric.actual >= metric.goal ? <CheckCircle className="h-5 w-5 text-green-600 mx-auto" /> : <XCircle className="h-5 w-5 text-red-600 mx-auto" />}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="vto" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <Card><CardHeader><CardTitle>Core Values</CardTitle><CardDescription>The defining characteristics of your company culture</CardDescription></CardHeader><CardContent><div className="flex flex-wrap gap-2">{["Integrity in Everything", "Relentless Improvement", "Client Success First", "Collaborative Excellence", "Innovation with Purpose"].map((value, i) => <Badge key={i} variant="secondary" className="text-sm py-1 px-3">{value}</Badge>)}</div></CardContent></Card>
                <Card><CardHeader><CardTitle>Core Focus</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label className="text-muted-foreground">Purpose</Label><p className="text-lg font-medium mt-1">Transforming American manufacturers into world-class OEM suppliers</p></div><div><Label className="text-muted-foreground">Niche</Label><p className="text-lg font-medium mt-1">Mid-market manufacturing companies seeking OEM supplier qualification</p></div></CardContent></Card>
                <Card><CardHeader><CardTitle>10-Year Target (BHAG)</CardTitle></CardHeader><CardContent><p className="text-lg font-medium italic">"By December 2034, Strategic Value Plus will have transformed 2,000 U.S. manufacturers into world-class OEM suppliers, creating 50,000+ American manufacturing jobs."</p></CardContent></Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rocks" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">Quarterly Rocks - {currentQuarter}</h2><p className="text-sm text-muted-foreground">3-7 top priorities for the quarter</p></div><Button><Plus className="h-4 w-4 mr-2" />Add Rock</Button></div>
                <div className="grid gap-4">
                  {rocks.map(rock => (
                    <Card key={rock.id}><CardContent className="pt-6"><div className="flex items-start gap-4"><Badge className={cn("mt-1", getStatusColor(rock.status))}>{getStatusIcon(rock.status)}<span className="ml-1 capitalize">{rock.status.replace("-", " ")}</span></Badge><div className="flex-1"><h3 className="font-semibold">{rock.description}</h3><div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><UserCheck className="h-4 w-4" />{rock.owner}</span><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due: {new Date(rock.dueDate).toLocaleDateString()}</span></div><div className="mt-3"><div className="flex items-center justify-between text-sm mb-1"><span>Progress</span><span className="font-medium">{rock.progress}%</span></div><Progress value={rock.progress} className="h-2" /></div></div><div className="flex gap-2"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div></div></CardContent></Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="scorecard" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">Weekly Scorecard</h2><p className="text-sm text-muted-foreground">5-15 weekly measurables</p></div><Button><Plus className="h-4 w-4 mr-2" />Add Metric</Button></div>
                <Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Metric</TableHead><TableHead>Owner</TableHead><TableHead className="text-right">Goal</TableHead><TableHead className="text-right">Actual</TableHead><TableHead className="text-center">Trend</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{metrics.map(metric => (<TableRow key={metric.id}><TableCell className="font-medium">{metric.name}</TableCell><TableCell>{metric.owner}</TableCell><TableCell className="text-right">{metric.unit}{metric.goal.toLocaleString()}</TableCell><TableCell className={cn("text-right font-medium", metric.actual >= metric.goal ? "text-green-600" : "text-red-600")}>{metric.unit}{metric.actual.toLocaleString()}</TableCell><TableCell className="text-center">{getTrendIcon(metric.trend)}</TableCell><TableCell className="text-center">{metric.actual >= metric.goal ? <Badge className="bg-green-100 text-green-700">At Goal</Badge> : <Badge className="bg-red-100 text-red-700">Below Goal</Badge>}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="issues" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">Issues List</h2><p className="text-sm text-muted-foreground">IDS: Identify, Discuss, Solve</p></div><Button><Plus className="h-4 w-4 mr-2" />Add Issue</Button></div>
                <div className="grid gap-4">
                  {issues.map(issue => (
                    <Card key={issue.id}><CardContent className="pt-6"><div className="flex items-start gap-4"><Badge className={getPriorityColor(issue.priority)}>{issue.priority.toUpperCase()}</Badge><div className="flex-1"><h3 className="font-semibold">{issue.description}</h3><div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><UserCheck className="h-4 w-4" />{issue.owner}</span><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Identified: {new Date(issue.identifiedDate).toLocaleDateString()}</span><Badge variant="outline" className="capitalize">{issue.status.replace("-", " ")}</Badge></div></div><div className="flex gap-2"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>{issue.status !== "solved" && <Button variant="ghost" size="icon" className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>}</div></div></CardContent></Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="meetings" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">Level 10 Meetings</h2><p className="text-sm text-muted-foreground">Weekly leadership team meetings</p></div><Button><Plus className="h-4 w-4 mr-2" />Log Meeting</Button></div>
                <div className="grid gap-4">
                  {meetings.map(meeting => (
                    <Card key={meeting.id}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><h3 className="font-semibold">{new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3><div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{meeting.startTime} - {meeting.endTime}</span><span className="flex items-center gap-1"><Users className="h-4 w-4" />{meeting.attendees.length} attendees</span></div></div><div className="text-right"><div className="flex items-center gap-1"><span className="text-2xl font-bold">{meeting.rating}</span><span className="text-muted-foreground">/10</span></div><p className="text-sm text-muted-foreground">Meeting Rating</p></div></div><div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t"><div className="text-center"><p className="text-2xl font-bold text-purple-600">{meeting.issuesSolved}</p><p className="text-xs text-muted-foreground">Issues Solved</p></div><div className="text-center">{meeting.rocksReviewed ? <CheckCircle className="h-6 w-6 text-green-600 mx-auto" /> : <XCircle className="h-6 w-6 text-red-600 mx-auto" />}<p className="text-xs text-muted-foreground">Rocks Reviewed</p></div><div className="text-center">{meeting.scorecardReviewed ? <CheckCircle className="h-6 w-6 text-green-600 mx-auto" /> : <XCircle className="h-6 w-6 text-red-600 mx-auto" />}<p className="text-xs text-muted-foreground">Scorecard Reviewed</p></div><div className="text-center"><p className="text-2xl font-bold text-blue-600">{meeting.todoCompletionRate}%</p><p className="text-xs text-muted-foreground">To-Do Completion</p></div></div></CardContent></Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="todos" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">To-Do List</h2><p className="text-sm text-muted-foreground">Action items from Level 10 meetings</p></div><Button><Plus className="h-4 w-4 mr-2" />Add To-Do</Button></div>
                <div className="grid gap-4">
                  {todos.map(todo => (
                    <Card key={todo.id} className={cn(todo.status === "complete" && "opacity-60")}><CardContent className="pt-6"><div className="flex items-center gap-4"><Checkbox checked={todo.status === "complete"} className="h-5 w-5" /><div className="flex-1"><p className={cn("font-medium", todo.status === "complete" && "line-through")}>{todo.description}</p><div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground"><span className="flex items-center gap-1"><UserCheck className="h-4 w-4" />{todo.owner}</span><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due: {new Date(todo.dueDate).toLocaleDateString()}</span></div></div><Badge variant="outline" className={cn("capitalize", todo.status === "complete" && "bg-green-100 text-green-700", todo.status === "in-progress" && "bg-blue-100 text-blue-700")}>{todo.status.replace("-", " ")}</Badge></div></CardContent></Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="people" className="flex-1 m-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">People Analyzer (GWC)</h2><p className="text-sm text-muted-foreground">Right people in the right seats</p></div><Button><Plus className="h-4 w-4 mr-2" />Add Team Member</Button></div>
                <Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-center">Gets It</TableHead><TableHead className="text-center">Wants It</TableHead><TableHead className="text-center">Capacity</TableHead><TableHead className="text-center">Right Seat</TableHead></TableRow></TableHeader><TableBody>{team.map(member => (<TableRow key={member.id}><TableCell className="font-medium">{member.name}</TableCell><TableCell>{member.role}</TableCell><TableCell className="text-center">{member.getsIt === true ? <CheckCircle className="h-5 w-5 text-green-600 mx-auto" /> : member.getsIt === false ? <XCircle className="h-5 w-5 text-red-600 mx-auto" /> : <Minus className="h-5 w-5 text-gray-400 mx-auto" />}</TableCell><TableCell className="text-center">{member.wantsIt === true ? <CheckCircle className="h-5 w-5 text-green-600 mx-auto" /> : member.wantsIt === false ? <XCircle className="h-5 w-5 text-red-600 mx-auto" /> : <Minus className="h-5 w-5 text-gray-400 mx-auto" />}</TableCell><TableCell className="text-center">{member.capacityToDoIt === true ? <CheckCircle className="h-5 w-5 text-green-600 mx-auto" /> : member.capacityToDoIt === false ? <XCircle className="h-5 w-5 text-red-600 mx-auto" /> : <Minus className="h-5 w-5 text-gray-400 mx-auto" />}</TableCell><TableCell className="text-center">{member.rightSeat === true ? <CheckCircle className="h-5 w-5 text-green-600 mx-auto" /> : member.rightSeat === false ? <XCircle className="h-5 w-5 text-red-600 mx-auto" /> : <Minus className="h-5 w-5 text-gray-400 mx-auto" />}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showPlaybookChat} onOpenChange={setShowPlaybookChat}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-600" />Traction Assistant - Playbook Generator</DialogTitle><DialogDescription>AI-powered Mattermost Playbook creation</DialogDescription></DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] rounded-lg p-3", msg.role === "user" ? "bg-purple-600 text-white" : "bg-muted")}>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    {msg.actions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.actions.map((action, i) => (
                          <Button key={i} variant={msg.role === "user" ? "secondary" : "outline"} size="sm" onClick={() => sendChatMessage(action.value)}>{action.label}</Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiThinking && <div className="flex justify-start"><div className="bg-muted rounded-lg p-3"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-4 border-t">
            <Input placeholder="Type your response..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChatMessage(chatInput)} />
            <Button onClick={() => sendChatMessage(chatInput)} disabled={!chatInput.trim() || isAiThinking}><Send className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
