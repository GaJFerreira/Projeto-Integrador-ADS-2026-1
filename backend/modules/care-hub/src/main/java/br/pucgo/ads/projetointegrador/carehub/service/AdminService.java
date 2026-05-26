package br.pucgo.ads.projetointegrador.carehub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Administrador;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.AdministradorRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private CuidadorRepository cuidadorRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private AdministradorRepository administradorRepository;

    public List<Object> listarTodosUsuarios() {
        List<Object> all = new ArrayList<>();
        all.addAll(cuidadorRepository.findAll());
        all.addAll(clienteRepository.findAll());
        all.addAll(administradorRepository.findAll());
        return all;
    }

    public Object buscarUsuarioPorId(Long id) {
        Objects.requireNonNull(id, "id não pode ser nulo");
        Optional<Cuidador> oc = cuidadorRepository.findById(id);
        if (oc.isPresent()) return oc.get();
        Optional<Cliente> ocl = clienteRepository.findById(id);
        if (ocl.isPresent()) return ocl.get();
        Optional<Administrador> oa = administradorRepository.findById(id);
        if (oa.isPresent()) return oa.get();
        throw new RuntimeException("Usuário não encontrado");
    }

    @Transactional
    public Object alterarStatusUsuario(Long id, Boolean ativo) {
        Objects.requireNonNull(id, "id não pode ser nulo");
        Objects.requireNonNull(ativo, "ativo não pode ser nulo");
        
        Optional<Cuidador> oc = cuidadorRepository.findById(id);
        if (oc.isPresent()) {
            Cuidador u = oc.get();
            u.setStatus(ativo ? "ACTIVE" : "INACTIVE");
            u.setAtivo(ativo);
            u.setDeletedAt(ativo ? null : java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC));
            return cuidadorRepository.save(u);
        }
        
        Optional<Cliente> ocl = clienteRepository.findById(id);
        if (ocl.isPresent()) {
            Cliente u = ocl.get();
            u.setStatus(ativo ? "ACTIVE" : "INACTIVE");
            u.setAtivo(ativo);
            u.setDeletedAt(ativo ? null : java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC));
            return clienteRepository.save(u);
        }
        
        Optional<Administrador> oa = administradorRepository.findById(id);
        if (oa.isPresent()) {
            Administrador u = oa.get();
            u.setStatus(ativo ? "ACTIVE" : "INACTIVE");
            u.setAtivo(ativo);
            u.setDeletedAt(ativo ? null : java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC));
            return administradorRepository.save(u);
        }
        
        throw new RuntimeException("Usuário não encontrado");
    }

    @Transactional
    public void deletarUsuario(Long id) {
        Objects.requireNonNull(id, "id não pode ser nulo");
        
        if (cuidadorRepository.existsById(id)) {
            cuidadorRepository.deleteById(id);
            return;
        }
        if (clienteRepository.existsById(id)) {
            clienteRepository.deleteById(id);
            return;
        }
        if (administradorRepository.existsById(id)) {
            administradorRepository.deleteById(id);
            return;
        }
        throw new RuntimeException("Usuário não encontrado");
    }
}
