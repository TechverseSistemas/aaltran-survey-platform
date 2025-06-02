import { clientCompanyService } from '@/lib/services/companies.service';
import { Company } from '@/lib/types/companies.type';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const companyData = (await request.json()) as Omit<Company, 'id' | 'created_at'>;
    // Adicionar validação para companyData aqui
    if (!companyData.cnpj || !companyData.fantasy_name) {
      return NextResponse.json({ error: 'CNPJ e Nome Fantasia são obrigatórios' }, { status: 400 });
    }
    const companyId = await clientCompanyService.create(companyData);
    return NextResponse.json(
      { id: companyId, message: 'Empresa cliente criada com sucesso' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar empresa cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar empresa cliente' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const companies = await clientCompanyService.getAll();
    return new Response(JSON.stringify(companies), {
      headers: { 'content-type': 'application/json' },
      status: 201,
    });
  } catch (error: any) {
    console.error('Erro ao buscar empresas clientes:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar empresas clientes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const companyData = (await request.json()) as Company;
    if (!companyData.id) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 });
    }
    const updatedCompany = await clientCompanyService.update(companyData.id, companyData);
    return NextResponse.json(
      { message: 'Empresa cliente atualizada com sucesso', company: updatedCompany },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar empresa cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar empresa cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID da empresa é obrigatório' }, { status: 400 });
    }
    await clientCompanyService.delete(id);
    return NextResponse.json({ message: 'Empresa cliente excluída com sucesso' }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao excluir empresa cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao excluir empresa cliente' },
      { status: 500 }
    );
  }
}
