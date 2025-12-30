import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Plus,
  FileSpreadsheet,
  Activity,
  Trash2,
  Edit,
  History,
  LayoutGrid,
  Filter,
  HelpCircle,
  X,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  Megaphone,
  Flag,
  Flame,
  BarChart2,
  ShieldAlert,
  Sliders,
  CheckSquare,
  FileText
} from 'lucide-react';

// --- 类型定义 ---

type TabType = '日报预警' | '预警通知' | '任务设定' | '任务' | '工作日报' | '公告配置';

// --- 配置项 ---

const HEADER_TOOLTIPS: Record<string, string> = {
  '400总接听量': '正常类400客户量+其他类客户的总接听数',
  '其它类客户占比': '其他类400客户/400总接听量',
  '正常类400客户占比': '100%-其它类客户占比',
  '预约单转化率': '预约单录单量/预约单回访量',
  '400电话转化率': '400电话录单量/（400总接听数*正常类400客户占比比例）',
  '线上转化率': '线上录单量/线上正常咨询量'
};

const TAB_CONFIGS: Record<TabType, { search: string[], headers: string[], color: string, bgColor: string, borderColor: string }> = {
  '日报预警': {
    search: ['部门', '用户', '配置项', '预警类型'],
    headers: ['部门', '创建时间', '用户', '预警类型', '配置项', '预警天数', '预警值', '创建人', '接收人id', '备注'],
    color: '#ff4d4f',
    bgColor: '#fff1f0',
    borderColor: '#ffa39e'
  },
  '预警通知': {
    search: ['创建时间'],
    headers: ['姓名', '预警时间', '预警类型', '内容', '创建者', '创建时间'],
    color: '#faad14',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f'
  },
  '任务设定': {
    search: ['用户名', '任务名称', '状态'],
    headers: ['创建者', '创建时间', '任务名称', '用户名', '任务设定值', '状态', '备注'],
    color: '#1890ff',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  '任务': {
    search: ['任务日期', '用户名', '任务名称', '完成状态'],
    headers: ['用户名', '任务名称', '完成状态', '任务日期', '任务设定', '当前完成数', '凭证'],
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  '工作日报': {
    search: ['职级', '填写人', '部门', '日报时间'],
    headers: [
      '批注确认状态', '填写人', '部门', '应到人数', '实到人数', '平均单数', '职级', '填写时间', '日报时间',
      '其它类400客户量', '正常类400客户量', '400总接听量', '其它类客户占比', '正常类400客户占比',
      '预约单录单量', '预约单回访量', '预约单转化率',
      '400电话录单量', '400电话转化率',
      '线上录单量', '线上正常咨询量', '线上刷单咨询量', '线上转化率',
      '月平均目标转化率', '明日计划录单量', '当日问题与建议',
      '情况说明', '明日计划', '批注'
    ],
    color: '#13c2c2',
    bgColor: '#e6fffb',
    borderColor: '#87e8de'
  },
  '公告配置': {
    search: ['发布时间', '公告类型', '发布对象', '发布状态', '起止时间', '标题', '生效状态'],
    headers: ['文号', '公告类型', '标题', '公告对象', '发布时间', '起止时间', '是否生效', '附件', '发布状态'],
    color: '#722ed1',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  }
};

// --- Mock Data 生成 ---

const generateRows = (tab: TabType): any[] => {
  const config = TAB_CONFIGS[tab];
  
  return Array.from({ length: 20 }).map((_, i) => {
    const row: any = { id: i + 1 };
    
    // 特殊处理工作日报的数据生成逻辑
    if (tab === '工作日报') {
      // 基础数据生成
      const other400 = Math.floor(Math.random() * 100) + 20; // 其它类400客户量
      const normal400 = Math.floor(Math.random() * 200) + 50; // 正常类400客户量
      const appointRecord = Math.floor(Math.random() * 50) + 10; // 预约单录单量
      const appointReturn = Math.floor(Math.random() * 50) + appointRecord; // 预约单回访量 (通常回访 >= 录单)
      const phone400Record = Math.floor(Math.random() * 80) + 10; // 400电话录单量
      const onlineRecord = Math.floor(Math.random() * 100) + 20; // 线上录单量
      const onlineNormalConsult = Math.floor(Math.random() * 150) + onlineRecord; // 线上正常咨询量
      const onlineFakeConsult = Math.floor(Math.random() * 50); // 线上刷单咨询量
      const planRecord = Math.floor(Math.random() * 100) + 50; // 明日计划录单量
      
      // 公式计算
      const total400 = normal400 + other400;
      const otherRatio = total400 > 0 ? (other400 / total400) * 100 : 0;
      const normalRatio = 100 - otherRatio;
      const appointRatio = appointReturn > 0 ? (appointRecord / appointReturn) * 100 : 0;
      
      // 400电话转化率 = 400电话录单量 / （400总接听数 * 正常类400客户占比比例）
      // 注意：正常类400客户占比比例 = normalRatio / 100
      const phone400Denominator = total400 * (normalRatio / 100);
      const phone400Ratio = phone400Denominator > 0 ? (phone400Record / phone400Denominator) * 100 : 0;
      
      const onlineRatio = onlineNormalConsult > 0 ? (onlineRecord / onlineNormalConsult) * 100 : 0;
      const monthTargetRatio = (Math.random() * 30 + 10); // 月平均目标转化率随机

      // 填充数据
      config.headers.forEach(h => {
         if (h === '其它类400客户量') row[h] = other400;
         else if (h === '正常类400客户量') row[h] = normal400;
         else if (h === '400总接听量') row[h] = total400;
         else if (h === '其它类客户占比') row[h] = otherRatio.toFixed(2) + '%';
         else if (h === '正常类400客户占比') row[h] = normalRatio.toFixed(2) + '%';
         else if (h === '预约单录单量') row[h] = appointRecord;
         else if (h === '预约单回访量') row[h] = appointReturn;
         else if (h === '预约单转化率') row[h] = appointRatio.toFixed(2) + '%';
         else if (h === '400电话录单量') row[h] = phone400Record;
         else if (h === '400电话转化率') row[h] = phone400Ratio.toFixed(2) + '%';
         else if (h === '线上录单量') row[h] = onlineRecord;
         else if (h === '线上正常咨询量') row[h] = onlineNormalConsult;
         else if (h === '线上刷单咨询量') row[h] = onlineFakeConsult;
         else if (h === '线上转化率') row[h] = onlineRatio.toFixed(2) + '%';
         else if (h === '月平均目标转化率') row[h] = monthTargetRatio.toFixed(2) + '%';
         else if (h === '明日计划录单量') row[h] = planRecord;
         else if (h === '当日问题与建议') row[h] = '无明显异常，建议增加晚班客服人数';
         else if (h === '批注确认状态') row[h] = i % 2 === 0 ? '生效' : '失效'; // 复用原有逻辑
         else if (h === '填写人') row[h] = i % 3 === 0 ? '管理员' : (i % 3 === 1 ? '陈序麟' : '李可');
         else if (h === '部门') row[h] = i % 2 === 0 ? '派单' : '客服';
         else if (h === '职级') row[h] = `P${Math.floor(Math.random() * 3) + 4}`;
         else if (h.includes('时间') || h.includes('日期')) {
           // yy.MM.dd HH:mm 格式
           row[h] = `25.11.${String(20 - (i % 10)).padStart(2, '0')} 14:${String(10 + i).padStart(2, '0')}`;
         }
         else if (h === '应到人数' || h === '实到人数') row[h] = Math.floor(Math.random() * 10) + 20;
         else if (h === '平均单数') row[h] = Math.floor(Math.random() * 50) + 10;
         else if (h === '情况说明') row[h] = '--';
         else if (h === '明日计划') row[h] = '继续跟进意向客户';
         else if (h === '批注') row[h] = '--';
         else {
           // Fallback for other cols if any
           if (!row[h]) row[h] = '--';
         }
      });
      return row;
    }

    // 其他 Tab 的原有逻辑
    config.headers.forEach(h => {
      if (h.includes('时间') || h.includes('日期')) {
        row[h] = `2025-11-${String(20 - (i % 10)).padStart(2, '0')} 14:${String(10 + i).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`;
      } else if (h.includes('状态') || h.includes('级别')) {
        row[h] = i % 2 === 0 ? '生效' : '失效';
      } else if (h.includes('人') || h.includes('姓名') || h.includes('创建者')) {
        row[h] = i % 3 === 0 ? '管理员' : (i % 3 === 1 ? '陈序麟' : '李可');
      } else if (h === '部门') {
        row[h] = i % 2 === 0 ? '派单' : '客服';
      } else if (h.includes('值') || h.includes('数') || h.includes('量')) {
        row[h] = (Math.random() * 100).toFixed(i % 5 === 0 ? 0 : 2);
      } else if (h === '预警类型') {
        row[h] = i % 2 === 0 ? '数据预警' : '日报预警';
      } else if (h === '配置项') {
        row[h] = i % 2 === 0 ? '总单数' : '派单率';
      } else if (h === '标题') {
        row[h] = `系统升级通知 v${i + 1}.0`;
      } else if (h === '文号') {
        row[h] = `JXDJ-GG-2025101${i}`;
      } else {
        row[h] = '--';
      }
    });
    return row;
  });
};

// --- 子组件 ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden shrink-0 h-[60px]">
    {/* Left Label */}
    <div className="flex items-center gap-2 shrink-0">
      <div className="bg-[#1890ff] text-white text-[13px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 shadow-sm shadow-blue-100">
        <span>主要公告</span>
        <Bell size={14} fill="currentColor" />
      </div>
    </div>
    
    {/* Content Area */}
    <div className="flex-1 overflow-hidden relative h-full flex items-center">
      <div className="whitespace-nowrap animate-[marquee_3600s_linear_infinite] flex items-center gap-16 text-[13px] text-slate-700 font-medium">
        
        {/* Item 1 */}
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#1890ff]" fill="#1890ff" />
          <span>关于 2025 年度秋季职级晋升评审的通知：点击下方详情以阅读完整公告内容。</span>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-2">
           <AlertCircle size={16} className="text-[#faad14]" fill="#faad14" />
           <Megaphone size={16} className="text-slate-700" />
           <span>系统升级通知：今晚 24:00 将进行系统维护。</span>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-2">
           <Flag size={16} className="text-[#ff4d4f]" fill="#ff4d4f" />
           <Flame size={16} className="text-[#faad14]" fill="#faad14" />
           <span>10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
        </div>
      </div>
    </div>

    {/* Right Date */}
    <div className="shrink-0 text-[13px] text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-md font-sans">
      2025-11-19
    </div>
    
    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabList: TabType[] = ['日报预警', '预警通知', '任务设定', '任务', '工作日报', '公告配置'];
  
  const tabConfig: Record<TabType, { icon: any, color: string }> = {
    '日报预警': { icon: ShieldAlert, color: '#ff4d4f' },
    '预警通知': { icon: Bell, color: '#faad14' },
    '任务设定': { icon: Sliders, color: '#1890ff' },
    '任务': { icon: CheckSquare, color: '#52c41a' },
    '工作日报': { icon: FileText, color: '#13c2c2' },
    '公告配置': { icon: Megaphone, color: '#722ed1' }
  };

  return (
    <div className="grid grid-cols-6 gap-3 mb-2">
      {tabList.map((tab) => {
        const isActive = activeTab === tab;
        const { icon: Icon, color } = tabConfig[tab];
        
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab as TabType)}
            style={{ borderColor: color }}
            className={`
              relative flex flex-row items-center justify-center gap-3 py-2 rounded-xl transition-all duration-200 border bg-white
              ${isActive 
                ? 'shadow-md transform scale-[1.02]' 
                : 'shadow-sm hover:shadow-md opacity-90 hover:opacity-100'
              }
            `}
          >
            {/* Icon Container */}
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform duration-200"
              style={{ backgroundColor: color }}
            >
              <Icon size={18} strokeWidth={2.5} />
            </div>
            
            {/* Label */}
            <span className={`text-[13px] font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
              {tab}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const DataOverview = ({ activeTab, onToggleFilter, isFilterOpen, onAdd }: { activeTab: TabType, onToggleFilter: () => void, isFilterOpen: boolean, onAdd: () => void }) => {
  const defaultData = [['待审核数', '12', '#ff4d4f'], ['今日已审核', '45', '#1890ff'], ['当月已审核', '892', '#52c41a'], ['当年已审核', '12540', '#722ed1']];
  
  const workDailyData = [
    ['其它类400客户量', '158', '#ff4d4f'],
    ['正常类400客户量', '342', '#1890ff'],
    ['400总接听量', '500', '#52c41a'],
    ['其它类客户占比', '31.6%', '#722ed1'],
    ['正常类400客户占比', '68.4%', '#13c2c2'],
    ['预约单录单量', '85', '#faad14'],
    ['预约单回访量', '80', '#eb2f96'],
    ['预约单转化率', '94.1%', '#2f54eb'],
    ['400电话录单量', '210', '#7cb305'],
    ['400电话转化率', '42.0%', '#fa541c']
  ];

  const data = activeTab === '工作日报' ? workDailyData : defaultData;
  const isWorkDaily = activeTab === '工作日报';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center shadow-sm h-[60px] mb-3">
      <div className="flex items-center gap-4 px-6 flex-1 overflow-x-auto no-scrollbar">
        <div className={`flex items-center gap-3 ${isWorkDaily ? 'mr-4' : 'mr-8'} shrink-0 sticky left-0 bg-white z-10 pr-4`}>
          <div className="w-9 h-9 rounded-full bg-[#1890ff] flex items-center justify-center shadow-sm shadow-blue-100">
             <BarChart2 size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-slate-700 tracking-tight whitespace-nowrap">数据概览</span>
        </div>
        <div className={`flex items-center ${isWorkDaily ? 'gap-3' : 'gap-16'} shrink-0`}>
          {data.map(([label, val, color]) => (
            <div key={label} className={`flex flex-row items-center ${isWorkDaily ? 'gap-1.5' : 'gap-3'} whitespace-nowrap`}>
              <span className={`${isWorkDaily ? 'text-[11px]' : 'text-[13px]'} text-slate-500 font-medium`}>{label}</span>
              <span className={`${isWorkDaily ? 'text-[16px]' : 'text-[22px]'} font-bold font-sans leading-none tracking-tight`} style={{ color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 新增按钮移到这里 */}
      <div className="h-full flex items-center border-l border-slate-100 pl-4 pr-2">
        <button 
          onClick={onAdd}
          className="h-8 px-4 bg-[#1890ff] text-white rounded-lg text-[13px] font-bold flex items-center gap-1.5 hover:bg-blue-600 shadow-sm transition-all whitespace-nowrap"
        >
          <Plus size={16}/> {activeTab === '公告配置' ? '新建公告' : '新增'}
        </button>
      </div>

      <div 
        onClick={onToggleFilter}
        className={`h-full px-8 flex items-center gap-2 font-bold text-[13px] cursor-pointer transition-all duration-300 shrink-0 z-10 ${
          isFilterOpen ? 'bg-[#1890ff] text-white' : 'bg-[#f0f5ff] text-[#1890ff] hover:bg-[#e6f7ff]'
        }`}
      >
        {isFilterOpen ? <Filter size={16} /> : <Search size={16} />}
        <span>{isFilterOpen ? '收起高级筛选' : '点这高级筛选'}</span>
      </div>
    </div>
  );
};

const SearchPanel = ({ tab, isOpen }: { tab: TabType, isOpen: boolean }) => {
  if (!isOpen) return null;
  const config = TAB_CONFIGS[tab];
  if (config.search.length === 0) return null;

  const renderField = (field: string) => (
    <div key={field} className="flex items-center gap-3 min-w-[220px]">
      <span className="text-[12px] text-slate-600 font-bold shrink-0 whitespace-nowrap">{field}</span>
      {field.includes('时间') || field.includes('日期') || field === '起止时间' ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
          <span className="text-slate-300 text-[10px] font-bold">至</span>
          <input type="date" className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
        </div>
      ) : (
        <input type="text" placeholder="输入关键字..." className="flex-1 border border-slate-200 rounded-lg h-8 px-3 text-[12px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-md mb-3 animate-[slideDown_0.3s_ease-out] overflow-x-auto">
      <div className="flex flex-nowrap gap-x-8 items-center min-w-max">
        <div className="flex flex-nowrap gap-x-8 items-center">
          {config.search.map(renderField)}
        </div>
        
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-8">
          <button className="h-8 px-6 bg-[#1890ff] text-white rounded-lg text-[12px] font-bold hover:bg-blue-600 shadow-sm active:shadow-none transition-all">搜索</button>
          <button className="h-8 px-6 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-white transition-all">重置</button>
        </div>

        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-8">
          <button className="h-8 px-4 bg-[#52c41a] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-green-600 shadow-sm transition-all">
            <FileSpreadsheet size={16}/> 导出
          </button>
          
          {tab === '工作日报' && (
            <>
              <button className="h-8 px-4 bg-[#faad14] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-yellow-600 shadow-sm transition-all">
                <History size={16}/> 未写日报
              </button>
              <button className="h-8 px-4 bg-[#13c2c2] text-white rounded-lg text-[12px] font-bold flex items-center gap-1.5 hover:bg-teal-600 shadow-sm transition-all">
                <LayoutGrid size={16}/> 日报汇总
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

const AddModal = ({ isOpen, onClose, activeTab }: { isOpen: boolean; onClose: () => void; activeTab: TabType }) => {
  if (!isOpen) return null;

  const [department, setDepartment] = useState<'客服' | '派单'>('客服');
  const [rank, setRank] = useState<'主管' | '组员'>('组员');

  const csFields = [
    "其它类400客户量",
    "正常类400客户量",
    "预约单录单量",
    "预约单回访量",
    "400电话录单量",
    "线上录单量",
    "线上正常咨询量",
    "线上刷单咨询量",
    "月平均目标转化率",
    "明日计划录单量"
  ];

  const dispatcherFields = [
    "电话拨打量", "新增资源数",
    "收款数", "收款率",
    "总单数", "未派单数",
    "派单率", "处理售后数",
    "好评数", "总业绩",
    "回访数", "刷销量"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-[800px] rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <span className="text-[16px] font-bold text-slate-800">新增</span>
            {activeTab === '工作日报' && (
              <>
                 {/* Department Toggle */}
                <div className="flex items-center gap-2 text-[13px]">
                   <span className="text-slate-600 font-medium">部门:</span>
                   <div className="flex bg-slate-100 rounded p-0.5">
                      <button 
                        onClick={() => setDepartment('客服')}
                        className={`px-3 py-1 rounded transition-all ${department === '客服' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                      >客服</button>
                      <button 
                        onClick={() => setDepartment('派单')}
                        className={`px-3 py-1 rounded transition-all ${department === '派单' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                      >派单</button>
                   </div>
                </div>

                {/* Rank Toggle */}
                <div className="flex items-center gap-2 text-[13px]">
                   <span className="text-slate-600 font-medium">职级:</span>
                   <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${rank === '主管' ? 'border-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
                          {rank === '主管' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <span className="text-slate-600">主管</span>
                        <input type="radio" name="rank" className="hidden" checked={rank === '主管'} onChange={() => setRank('主管')} />
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${rank === '组员' ? 'border-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
                          {rank === '组员' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <span className="text-slate-600">组员</span>
                        <input type="radio" name="rank" className="hidden" checked={rank === '组员'} onChange={() => setRank('组员')} />
                      </label>
                   </div>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {activeTab === '工作日报' && department === '派单' ? (
             <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                
                {/* 日报时间 */}
                <div className="flex items-center">
                  <label className="w-24 text-right text-[13px] text-slate-600 font-medium mr-4 flex justify-end gap-1 shrink-0">
                    <span className="text-red-500">*</span> 日报时间
                  </label>
                  <div className="flex-1 relative">
                     <input type="text" placeholder="选择时间" className="w-full h-9 border border-slate-200 rounded px-3 pl-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
                     <Clock size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                  </div>
                </div>

                {/* Dispatcher Text Fields */}
                {dispatcherFields.map(label => (
                  <div key={label} className="flex items-center">
                    <label className="w-24 text-right text-[13px] text-slate-600 font-medium mr-4 flex justify-end gap-1 shrink-0">
                      {label}
                    </label>
                    <input type="text" placeholder="请输入内容" className="flex-1 h-9 border border-slate-200 rounded px-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
                  </div>
                ))}
                
                {/* 情况说明 - Full width */}
                <div className="col-span-2 flex items-start">
                  <label className="w-24 text-right text-[13px] text-slate-600 font-medium mr-4 mt-2 flex justify-end gap-1 shrink-0">
                     情况说明
                  </label>
                  <textarea placeholder="请输入内容" className="flex-1 h-24 border border-slate-200 rounded p-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none placeholder:text-slate-300"></textarea>
                </div>

                {/* 图片 Upload - Full width */}
                <div className="col-span-2 flex items-start">
                  <label className="w-24 text-right text-[13px] text-slate-600 font-medium mr-4 mt-2 flex justify-end gap-1 shrink-0">
                     图片
                  </label>
                  <div className="flex-1">
                    <div className="w-24 h-24 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-500">
                       <Plus size={24} strokeWidth={1} />
                    </div>
                  </div>
                </div>

             </div>
          ) : (
            // Default Customer Service Layout
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
               {csFields.map(label => (
                  <div key={label} className="flex items-center">
                    <label className="w-32 text-right text-[13px] text-slate-600 font-medium mr-4 flex justify-end gap-1 shrink-0">
                      <span className="text-red-500">*</span> {label}
                    </label>
                    <input type="text" placeholder="请输入内容" className="flex-1 h-9 border border-slate-200 rounded px-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300" />
                  </div>
               ))}
                <div className="col-span-2 flex items-start">
                  <label className="w-32 text-right text-[13px] text-slate-600 font-medium mr-4 mt-2 flex justify-end gap-1 shrink-0">
                     <span className="text-red-500">*</span> 当日问题与建议
                  </label>
                  <textarea placeholder="请输入内容" className="flex-1 h-24 border border-slate-200 rounded p-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none placeholder:text-slate-300"></textarea>
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-lg">
          <button onClick={onClose} className="px-6 py-2 border border-slate-200 bg-white text-slate-600 text-[13px] rounded hover:bg-slate-50 hover:border-slate-300 transition-all">取消</button>
          <button className="px-6 py-2 bg-[#1890ff] text-white text-[13px] rounded hover:bg-blue-600 shadow-sm transition-all">确定</button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('工作日报');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const rows = useMemo(() => generateRows(activeTab), [activeTab]);
  const config = TAB_CONFIGS[activeTab];

  return (
    <div className="h-screen bg-slate-50 p-6 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="max-w-[1800px] w-full mx-auto flex flex-col flex-1 min-h-0">
        <NotificationBar />
        
        <TabSelector activeTab={activeTab} onSelect={setActiveTab} />
        
        <DataOverview 
          activeTab={activeTab} 
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          isFilterOpen={isFilterOpen}
          onAdd={() => setIsAddModalOpen(true)}
        />
        
        <SearchPanel tab={activeTab} isOpen={isFilterOpen} />

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Table Header */}
          <div className="overflow-auto custom-scrollbar flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-[#fafafa] shadow-sm">
                <tr>
                  {config.headers.map((header) => (
                    <th key={header} className="px-4 py-3 text-[11.7px] font-bold text-slate-700 border-b border-slate-200 bg-[#fafafa] whitespace-nowrap group min-w-[100px]">
                      <div className="flex items-center gap-1.5">
                        {header}
                        {HEADER_TOOLTIPS[header] && (
                          <div className="relative group/tooltip">
                            <HelpCircle size={13} className="text-slate-400 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none w-max max-w-[250px] z-50 whitespace-normal text-center">
                              {HEADER_TOOLTIPS[header]}
                              <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[11.7px] font-bold text-slate-700 border-b border-slate-200 bg-[#fafafa] text-center w-24 sticky right-0 z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)]">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-blue-50/50 transition-colors border-b border-[#cbd5e1] last:border-0 group"
                  >
                    {config.headers.map((header) => (
                      <td key={`${row.id}-${header}`} className="px-4 py-3 text-[13px] text-slate-600 border-b border-[#cbd5e1] whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis">
                         {header === '凭证' || header === '附件' ? (
                           <div className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline">
                              <ImageIcon size={14}/> <span>查看</span>
                           </div>
                         ) : (
                           <span className={header.includes('状态') && row[header] === '生效' ? 'text-green-600 font-medium' : ''}>
                             {row[header]}
                           </span>
                         )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-[13px] border-b border-[#cbd5e1] sticky right-0 bg-white group-hover:bg-blue-50/50 transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)] text-center z-10">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-blue-500 hover:bg-blue-100 rounded transition-colors" title="编辑">
                          <Edit size={14} />
                        </button>
                        <button className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors" title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="h-12 border-t border-slate-200 bg-white flex items-center justify-center gap-6 px-6 shrink-0 z-20">
             <div className="text-[13px] text-slate-500">
               共 <span className="font-bold text-slate-700">458</span> 条记录
             </div>
             <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                   {[1, 2, 3, 4, 5].map(p => (
                     <button key={p} className={`w-8 h-8 rounded text-[13px] font-medium transition-all ${p === 1 ? 'bg-[#1890ff] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                       {p}
                     </button>
                   ))}
                   <span className="flex items-center justify-center w-8 h-8 text-slate-400">...</span>
                   <button className="w-8 h-8 rounded text-[13px] font-medium text-slate-600 hover:bg-slate-100">50</button>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all">
                  <ChevronRight size={16} />
                </button>
                <div className="ml-4 flex items-center gap-2 text-[13px] text-slate-500">
                   <span>前往</span>
                   <input type="text" className="w-10 h-7 border border-slate-200 rounded text-center outline-none focus:border-blue-400 transition-all" defaultValue="1" />
                   <span>页</span>
                </div>
             </div>
          </div>
        </div>

      </div>

      <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} activeTab={activeTab} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }