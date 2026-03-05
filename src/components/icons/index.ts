export {
  // Navigation
  Home, Clock, Users, User, Plus, Search, Settings, Bell, ChevronLeft, X,
  // Categories
  Utensils, Plane, ShoppingBag, MoreHorizontal, Fuel, Zap, TrendingUp, TrendingDown,
  // Actions
  ArrowDownLeft, ArrowUpRight, Send, Share2, Edit, Trash2, Camera, QrCode,
  // Status
  Check, AlertTriangle, WifiOff, RefreshCw, Shield, Lock, Mail, Eye, EyeOff,
  Edit2, ArrowRightLeft // Added from usage
} from 'lucide-react-native';

// Category mapping for expense types
export const categoryIcons = {
  food: 'Utensils',
  travel: 'Plane',
  shopping: 'ShoppingBag',
  transport: 'Fuel',
  entertainment: 'Zap',
  utilities: 'Zap',
  other: 'MoreHorizontal',
} as const;
