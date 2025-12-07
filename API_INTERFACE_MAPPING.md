# 前后端API接口映射文档

## 概述
本文档记录东里村智能导游系统前后端API接口的映射关系，确保前后端接口参数一致。

## 接口映射表

### 1. 认证API
| 前端API | 后端API | HTTP方法 | 参数 | 返回值 | 状态 |
|---------|---------|----------|------|--------|------|
| `authApi.sendCode(phone)` | `/api/auth/send-code` | POST | `{phone: string}` | `{success: boolean, message: string}` | ✅ 已对齐 |
| `authApi.login(phone, code)` | `/api/auth/login` | POST | `{phone: string, code: string}` | `{success: boolean, data: {user: any, token: string}, message: string}` | ✅ 已对齐 |

### 2. 景点API
| 前端API | 后端API | HTTP方法 | 参数 | 返回值 | 状态 |
|---------|---------|----------|------|--------|------|
| `spotsApi.getSpots(params)` | `/api/spots` | GET | `category?: string, type?: string, page?: number, limit?: number` | `{success: boolean, data: any[], pagination: any}` | ✅ 已对齐 |
| `spotsApi.getSpotById(id)` | `/api/spots/:id` | GET | - | `{success: boolean, data: any}` | ✅ 已对齐 |

### 3. 人物API
| 前端API | 后端API | HTTP方法 | 参数 | 返回值 | 状态 |
|---------|---------|----------|------|--------|------|
| `figuresApi.getFigures(params)` | `/api/figures` | GET | `category?: string, type?: string, year?: number, page?: number, limit?: number` | `{success: boolean, data: any[], pagination: any}` | ✅ 已对齐 |
| `figuresApi.getFigureById(id)` | `/api/figures/:id` | GET | - | `{success: boolean, data: any}` | ✅ 已对齐 |

### 4. 公告API
| 前端API | 后端API | HTTP方法 | 参数 | 返回值 | 状态 |
|---------|---------|----------|------|--------|------|
| `announcementsApi.getAnnouncements(params)` | `/api/announcements` | GET | `type?: string, page?: number, limit?: number` | `{success: boolean, data: any[], pagination: any}` | ✅ 已对齐 |

### 5. 用户API
| 前端API | 后端API | HTTP方法 | 参数 | 返回值 | 状态 |
|---------|---------|----------|------|--------|------|
| `userApi.getProfile(token)` | `/api/user/profile` | GET | Header: `Authorization: Bearer {token}` | `{success: boolean, data: any}` | ✅ 已对齐 |

### 6. 打卡API
| 前端API | 后端API | HTTP方法 | 参数 | 返回值 | 状态 |
|---------|---------|----------|------|--------|------|
| `checkinApi.submitCheckin(token, spotId, spotName?)` | `/api/checkin` | POST | Header: `Authorization: Bearer {token}`, Body: `{spotId: string, spotName?: string}` | `{success: boolean, data: any, message: string}` | ✅ 已对齐 |
| `checkinApi.getCheckinRecords(token)` | `/api/checkin/records` | GET | Header: `Authorization: Bearer {token}` | `{success: boolean, data: any[]}` | ✅ 已对齐 |

## 接口规范

### 通用响应格式
```ts
{
  success: boolean;
  data?: any;       // 成功时返回的数据
  error?: string;   // 失败时的错误信息
  message?: string; // 提示信息
}
```

### 分页响应格式
```ts
{
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

### 错误处理规范
- 400: 请求参数错误
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误

## 状态说明
- ✅ 已对齐: 前后端接口已完全对应
- ⚠️ 待调整: 需要调整的接口
- ❌ 不一致: 前后端接口不匹配

## 备注
1. 所有API请求都应包含适当的错误处理
2. 前端API服务层应统一处理错误信息的展示
3. 建议在开发过程中定期检查此文档，确保接口一致性