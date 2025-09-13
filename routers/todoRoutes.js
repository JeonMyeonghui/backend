const express = require('express');
const mongoose = require('mongoose');
const Todo = require('../src/models/Todo');
const router = express.Router();

// 모든 할 일 조회 (페이지네이션, 필터링, 검색 지원)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      completed, 
      priority, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      dueSoon = false
    } = req.query;

    // 쿼리 빌더
    let query = {};
    
    // 완료 상태 필터
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    // 우선순위 필터
    if (priority) {
      query.priority = priority;
    }
    
    // 마감일 임박 필터
    if (dueSoon === 'true') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      query.completed = false;
      query.dueDate = { $lte: threeDaysFromNow, $gte: new Date() };
    }
    
    // 텍스트 검색
    if (search) {
      query.$text = { $search: search };
    }

    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 할 일 조회
    const todos = await Todo.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 전체 개수 조회
    const total = await Todo.countDocuments(query);
    
    // 통계 정보
    const stats = await Todo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: ['$completed', 0, 1] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: todos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      stats: stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      }
    });
  } catch (error) {
    console.error('할 일 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '할 일 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 할 일 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ID입니다.'
      });
    }

    const todo = await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('할 일 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '할 일을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 새 할 일 생성
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    // 입력 검증
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '제목은 필수입니다.'
      });
    }

    // 새 할 일 생성
    const newTodo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || []
    });

    const savedTodo = await newTodo.save();

    res.status(201).json({
      success: true,
      data: savedTodo,
      message: '할 일이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('할 일 생성 오류:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: '할 일을 생성하는 중 오류가 발생했습니다.'
    });
  }
});

// 할 일 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, dueDate, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ID입니다.'
      });
    }

    // 입력 검증
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '제목은 비어있을 수 없습니다.'
      });
    }

    // 할 일 업데이트
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        error: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: updatedTodo,
      message: '할 일이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('할 일 수정 오류:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: '할 일을 수정하는 중 오류가 발생했습니다.'
    });
  }
});

// 할 일 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ID입니다.'
      });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        error: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: deletedTodo,
      message: '할 일이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('할 일 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '할 일을 삭제하는 중 오류가 발생했습니다.'
    });
  }
});

// 할 일 완료/미완료 토글
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ID입니다.'
      });
    }

    const todo = await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: '해당 할 일을 찾을 수 없습니다.'
      });
    }

    // 완료 상태 토글
    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      success: true,
      data: todo,
      message: `할 일이 ${todo.completed ? '완료' : '미완료'}로 변경되었습니다.`
    });
  } catch (error) {
    console.error('할 일 토글 오류:', error);
    res.status(500).json({
      success: false,
      error: '할 일 상태를 변경하는 중 오류가 발생했습니다.'
    });
  }
});

// 모든 할 일 삭제
router.delete('/', async (req, res) => {
  try {
    const result = await Todo.deleteMany({});
    
    res.json({
      success: true,
      message: `모든 할 일(${result.deletedCount}개)이 성공적으로 삭제되었습니다.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('모든 할 일 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '할 일을 삭제하는 중 오류가 발생했습니다.'
    });
  }
});

// 통계 정보 조회
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Todo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          pending: { $sum: { $cond: ['$completed', 0, 1] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$dueDate', new Date()] }, { $eq: ['$completed', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      overdue: 0
    };

    // 완료율 계산
    result.completionRate = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;

