const mongoose = require('mongoose');

// Todo 스키마 정의
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '제목은 필수입니다.'],
    trim: true,
    maxlength: [100, '제목은 100자를 초과할 수 없습니다.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '설명은 500자를 초과할 수 없습니다.']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: '마감일은 현재 시간보다 미래여야 합니다.'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '태그는 20자를 초과할 수 없습니다.']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 관리
  versionKey: false // __v 필드 제거
});

// 인덱스 설정
todoSchema.index({ title: 'text', description: 'text' }); // 텍스트 검색용
todoSchema.index({ completed: 1, createdAt: -1 }); // 완료 상태와 생성일 기준 정렬
todoSchema.index({ priority: 1, dueDate: 1 }); // 우선순위와 마감일 기준 정렬

// 가상 필드: 남은 일수
todoSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// JSON 변환 시 가상 필드 포함
todoSchema.set('toJSON', { virtuals: true });

// 미들웨어: 업데이트 시 updatedAt 자동 갱신
todoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// 정적 메서드: 완료된 할 일 조회
todoSchema.statics.findCompleted = function() {
  return this.find({ completed: true }).sort({ updatedAt: -1 });
};

// 정적 메서드: 미완료 할 일 조회
todoSchema.statics.findPending = function() {
  return this.find({ completed: false }).sort({ priority: -1, dueDate: 1 });
};

// 정적 메서드: 우선순위별 조회
todoSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority }).sort({ createdAt: -1 });
};

// 정적 메서드: 마감일 임박 조회 (3일 이내)
todoSchema.statics.findDueSoon = function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  return this.find({ 
    completed: false, 
    dueDate: { $lte: threeDaysFromNow, $gte: new Date() }
  }).sort({ dueDate: 1 });
};

// 인스턴스 메서드: 할 일 완료 처리
todoSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.updatedAt = new Date();
  return this.save();
};

// 인스턴스 메서드: 할 일 미완료 처리
todoSchema.methods.markAsPending = function() {
  this.completed = false;
  this.updatedAt = new Date();
  return this.save();
};

// 인스턴스 메서드: 우선순위 변경
todoSchema.methods.changePriority = function(newPriority) {
  this.priority = newPriority;
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Todo', todoSchema);



