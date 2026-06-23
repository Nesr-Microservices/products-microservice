import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient, Product } from 'generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';


@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  private prisma: PrismaClient;

  constructor() {
      const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
      this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
      try {
          await this.prisma.$connect();
          this.logger.log('✅ Base de datos conectada exitosamente');
      } catch (error) {
          this.logger.error('❌ Error conectando a la base de datos', error);
      }
  }

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
    
  }

  async findAll( PaginationDto: PaginationDto) {
    
    const { page = 1, limit = 10 } = PaginationDto;
    const totalpages = await this.prisma.product.count({ where: { available: true } });
    const lastpage = Math.ceil(totalpages / limit);


    return {
      data: await this.prisma.product.findMany({
        take: limit,
        where: { available: true },
        skip: (page - 1) * limit,
        
      }),
      meta: {
        total: totalpages,
        page: page,
        lastpage: lastpage,
      }
    }
  }

  async findOne(id: number) {

    const product = await this.prisma.product.findFirst({
          where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id #${ id } not found`)
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: _, ...data } = updateProductDto;

    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    /* return this.prisma.product.delete({
      where: { id },
    }); */

    const product = await this.prisma.product.update({
      where: { id },
      data: { available: false },
    });

    return product;
  }
}
