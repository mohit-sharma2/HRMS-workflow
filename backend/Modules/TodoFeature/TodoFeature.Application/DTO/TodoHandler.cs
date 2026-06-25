using AutoMapper;
using HRMS.Core.Telemetry.Exceptions;
using HRMS.Shared.Application.Constants;
using HRMS.Shared.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using TodoFeature.Application.Repository;
using TodoFeature.Domain;

namespace TodoFeature.Application.DTO
{
    public class CreateTodoHandler : IRequestHandler<CreateTodoRequest, BaseResponse<CreateTodoResponse>>
    {
        private readonly IMapper _mapper;
        private readonly ITodoRepository _todoRepository;

        public CreateTodoHandler(IMapper mapper, ITodoRepository todoRepository)
        {
            _mapper = mapper;
            _todoRepository = todoRepository;
        }

        public async Task<BaseResponse<CreateTodoResponse>> Handle(CreateTodoRequest request, CancellationToken cancellationToken)
        {
            if (request == null || request.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var response = new BaseResponse<CreateTodoResponse>();
            var todo = _mapper.Map<Todo>(request.RequestParam);
            todo = await _todoRepository.AddItemAsync(todo);

            if (todo != null)
            {
                response.Data = new CreateTodoResponse { TodoId = todo.Id };
                response.StatusCode = StatusCodes.Status200OK;
                response.Message = string.Format(Messaging.Insert, nameof(Todo));
                response.Success = true;
            }

            return response;
        }
    }

    public sealed class GetAllTodosHandler : IRequestHandler<GetAllTodosRequest, BaseResponsePagination<GetAllTodosResponse>>
    {
        private readonly IMapper _mapper;
        private readonly ITodoRepository _todoRepository;

        public GetAllTodosHandler(ITodoRepository todoRepository, IMapper mapper)
        {
            _mapper = mapper;
            _todoRepository = todoRepository;
        }

        public async Task<BaseResponsePagination<GetAllTodosResponse>> Handle(GetAllTodosRequest request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var response = new BaseResponsePagination<GetAllTodosResponse>();
            (var todos, int count) = await _todoRepository.GetAllTodosWithCountAsync(request);

            if (todos != null && todos.Any())
            {
                var data = _mapper.Map<IReadOnlyList<Todo>, IReadOnlyList<GetAllTodosItem>>(todos.ToList());
                response.Data = new GetAllTodosResponse { Todos = data.ToList() };

                if (request.PageCriteria != null && request.PageCriteria.EnablePage)
                {
                    response.Meta = new Meta
                    {
                        Skip = request.PageCriteria.Skip,
                        Take = request.PageCriteria.PageSize,
                        TotalCount = count
                    };
                }
            }

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK;
            return response;
        }
    }

    public sealed class UpdateTodoHandler : IRequestHandler<UpdateTodoRequest, BaseResponse<UpdateTodoResponse>>
    {
        private readonly IMapper _mapper;
        private readonly ITodoRepository _todoRepository;

        public UpdateTodoHandler(IMapper mapper, ITodoRepository todoRepository)
        {
            _mapper = mapper;
            _todoRepository = todoRepository;
        }

        public async Task<BaseResponse<UpdateTodoResponse>> Handle(UpdateTodoRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _todoRepository.GetTodoAsync(new GetAllTodosRequest
            {
                RequestParam = new GetAllTodosDto { TodoId = request.RequestParam.TodoId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, nameof(Todo)));

            var todo = _mapper.Map<Todo>(request.RequestParam);
            todo.UserContext = existing.UserContext;
            todo.CreatedOn = existing.CreatedOn;
            todo.CreatedByUserId = existing.CreatedByUserId;
            todo.CreatedByUserName = existing.CreatedByUserName;

            await _todoRepository.UpdateItemAsync(existing.Id, todo);

            return new BaseResponse<UpdateTodoResponse>
            {
                Data = new UpdateTodoResponse { TodoId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Update, nameof(Todo)),
                Success = true
            };
        }
    }

    public sealed class DeleteTodoHandler : IRequestHandler<DeleteTodoRequest, BaseResponse<DeleteTodoResponse>>
    {
        private readonly ITodoRepository _todoRepository;

        public DeleteTodoHandler(ITodoRepository todoRepository)
        {
            _todoRepository = todoRepository;
        }

        public async Task<BaseResponse<DeleteTodoResponse>> Handle(DeleteTodoRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _todoRepository.GetTodoAsync(new GetAllTodosRequest
            {
                RequestParam = new GetAllTodosDto { TodoId = request.RequestParam.TodoId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, nameof(Todo)));

            await _todoRepository.DeleteItemAsync(existing.Id);

            return new BaseResponse<DeleteTodoResponse>
            {
                Data = new DeleteTodoResponse { TodoId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Delete, nameof(Todo)),
                Success = true
            };
        }
    }
}
